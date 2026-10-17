"""LAN multiplayer for Standoff Web 3D. Python standard library only.

One WebSocket room is one match. Server owns team assignment, health, kills and
rounds; clients provide movement and hit proposals (LAN/trusted-player prototype).
"""
import base64
import hashlib
import json
import re
import struct
import threading
import time
import uuid
from urllib.parse import parse_qs, urlsplit

WEAPONS = {
    "p350": (28, 180, 1), "deagle": (55, 400, 1),
    "ak47": (30, 100, 1), "awm": (115, 1500, 1),
    "mp7": (19, 75, 1), "m870": (13, 850, 9),
    "spas12": (10, 450, 8),
}
SPAWN = {"T": [-60, 1.7, 0], "CT": [60, 1.7, 0]}
PREPARE_SECONDS = 7
ROUND_END_SECONDS = 4
MAX_PLAYERS = 10
MAX_FRAME_BYTES = 65536


def read_exact(stream, count):
    data = stream.read(count)
    if data is None or len(data) != count:
        raise ConnectionError("Socket closed")
    return data


class Peer:
    def __init__(self, handler):
        self.handler = handler
        self.id = uuid.uuid4().hex[:10]
        self.send_lock = threading.Lock()
        self.name = "Player"
        self.team = "T"
        self.pos = SPAWN["T"][:]
        self.yaw = 0
        self.hp = 100
        self.alive = True
        self.weapon = "p350"
        self.last_fire = 0.0
        self.kills = 0
        self.deaths = 0

    def send(self, payload, opcode=1):
        data = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf8") if opcode == 1 else payload
        if len(data) < 126:
            header = bytes([0x80 | opcode, len(data)])
        elif len(data) < 65536:
            header = bytes([0x80 | opcode, 126]) + struct.pack("!H", len(data))
        else:
            header = bytes([0x80 | opcode, 127]) + struct.pack("!Q", len(data))
        with self.send_lock:
            self.handler.connection.sendall(header + data)


class Room:
    def __init__(self, name):
        self.name = name
        self.map = "city"
        self.lock = threading.RLock()
        self.players = {}
        self.phase = "waiting"
        self.deadline = 0
        self.round = 1
        self.score_t = 0
        self.score_ct = 0
        self.last_snapshot = 0

    def joined(self, peer, name, map_choice="city"):
        with self.lock:
            if len(self.players) >= MAX_PLAYERS:
                return False
            if not self.players:
                self.map = map_choice if map_choice in ("city", "desert") else "city"
            counts = {team: sum(p.team == team for p in self.players.values()) for team in ("T", "CT")}
            peer.team = "T" if counts["T"] <= counts["CT"] else "CT"
            peer.name = re.sub(r"[^\w -]", "", str(name), flags=re.UNICODE).strip()[:16] or "Player"
            peer.pos = SPAWN[peer.team][:]
            self.players[peer.id] = peer
            if self.phase == "waiting" and len(self.players) >= 2:
                self.start_round_locked()
        peer.send({"type": "welcome", "id": peer.id, "room": self.name})
        self.broadcast_snapshot()
        return True

    def left(self, peer):
        with self.lock:
            self.players.pop(peer.id, None)
            if len(self.players) < 2:
                self.phase = "waiting"
                self.deadline = 0
            if not self.players:
                self.round = 1
                self.score_t = 0
                self.score_ct = 0
            elif self.phase == "active":
                self.check_round_end_locked()
        self.broadcast_snapshot()

    def start_round_locked(self):
        self.phase = "preparing"
        self.deadline = time.monotonic() + PREPARE_SECONDS
        for p in self.players.values():
            p.hp = 100
            p.alive = True
            p.pos = SPAWN[p.team][:]
            p.last_fire = 0.0

    def check_round_end_locked(self):
        if self.phase != "active" or len(self.players) < 2:
            return
        alive = {team: sum(p.team == team and p.alive for p in self.players.values()) for team in ("T", "CT")}
        if alive["T"] and alive["CT"]:
            return
        if not alive["CT"] and alive["T"]:
            self.score_t += 1
        elif not alive["T"] and alive["CT"]:
            self.score_ct += 1
        else:
            return
        self.phase = "finished" if max(self.score_t, self.score_ct) >= 8 else "ended"
        self.deadline = time.monotonic() + ROUND_END_SECONDS

    def tick(self, now):
        with self.lock:
            if self.phase == "preparing" and now >= self.deadline:
                self.phase = "active"
                self.deadline = 0
            elif self.phase == "ended" and now >= self.deadline:
                self.round += 1
                if len(self.players) >= 2:
                    self.start_round_locked()
                else:
                    self.phase = "waiting"
            if now - self.last_snapshot < 0.10:
                return
            self.last_snapshot = now
        self.broadcast_snapshot()

    def broadcast(self, data):
        with self.lock:
            peers = list(self.players.values())
        for peer in peers:
            try:
                peer.send(data)
            except (ConnectionError, OSError):
                pass

    def broadcast_snapshot(self):
        with self.lock:
            remaining = max(0, self.deadline - time.monotonic()) if self.deadline else 0
            payload = {
                "type": "snapshot", "room": self.name, "map": self.map, "phase": self.phase,
                "remaining": round(remaining, 1), "round": self.round,
                "scoreT": self.score_t, "scoreCT": self.score_ct,
                "players": [
                    {"id": p.id, "name": p.name, "team": p.team, "pos": p.pos[:],
                     "yaw": p.yaw, "hp": round(p.hp, 1), "alive": p.alive,
                     "weapon": p.weapon, "kills": p.kills, "deaths": p.deaths}
                    for p in self.players.values()
                ],
            }
        self.broadcast(payload)

    def process(self, peer, msg):
        kind = msg.get("type")
        if kind == "state":
            position = msg.get("pos")
            if (isinstance(position, list) and len(position) == 3 and
                    all(type(v) in (int, float) and -10000 < v < 10000 for v in position)):
                with self.lock:
                    if peer.alive and self.phase == "active":
                        peer.pos = [max(-95, min(95, float(position[0]))),
                                    max(1.7, min(4.5, float(position[1]))),
                                    max(-95, min(95, float(position[2])))]
                    yaw = msg.get("yaw", 0)
                    if type(yaw) in (float, int) and -10000 < yaw < 10000:
                        peer.yaw = float(yaw)
                    gun = msg.get("weapon")
                    if gun in WEAPONS:
                        peer.weapon = gun
        elif kind == "fire":
            with self.lock:
                gun = msg.get("weapon")
                if gun not in WEAPONS or self.phase != "active" or not peer.alive:
                    return
                damage, delay, pellets = WEAPONS[gun]
                now = time.monotonic()
                if now - peer.last_fire < delay / 1000 * 0.85:
                    return
                peer.last_fire = now
                peer.weapon = gun
                self.broadcast({"type": "shot", "id": peer.id})
                claims = msg.get("hits", [])
                if not isinstance(claims, list):
                    claims = []
                used = 0
                for claim in claims[:10]:
                    if not isinstance(claim, dict):
                        continue
                    other = self.players.get(claim.get("id"))
                    count = claim.get("pellets", 1)
                    if type(count) is not int or count < 1:
                        continue
                    count = min(count, pellets - used)
                    if count <= 0:
                        break
                    used += count
                    if not other or other.team == peer.team or not other.alive:
                        continue
                    dist = sum((a - b) ** 2 for a, b in zip(peer.pos, other.pos))
                    if dist > 250 ** 2:
                        continue
                    part = claim.get("part")
                    mult = 2.5 if part == "head" else 0.7 if part in ("arm", "leg") else 1.0
                    other.hp = max(0, other.hp - count * damage * mult)
                    if other.hp == 0 and other.alive:
                        other.alive = False
                        other.deaths += 1
                        peer.kills += 1
                        self.broadcast({"type": "kill", "killer": peer.name, "victim": other.name,
                                        "headshot": part == "head"})
                self.check_round_end_locked()
            self.broadcast_snapshot()


class GameHub:
    def __init__(self):
        self.lock = threading.Lock()
        self.rooms = {}
        threading.Thread(target=self.loop, name="standoff-net", daemon=True).start()

    def room(self, name):
        with self.lock:
            if name not in self.rooms:
                self.rooms[name] = Room(name)
            return self.rooms[name]

    def loop(self):
        while True:
            now = time.monotonic()
            with self.lock:
                rooms = list(self.rooms.values())
            for room in rooms:
                room.tick(now)
            time.sleep(0.05)


HUB = GameHub()


def websocket(handler):
    """Upgrade an HTTP connection, then process masked RFC6455 text frames."""
    parsed = urlsplit(handler.path)
    room_name = parse_qs(parsed.query).get("room", ["public"])[0]
    if not re.fullmatch(r"[a-zA-Z0-9_-]{1,24}", room_name):
        handler.send_error(400, "Invalid room code")
        return
    key = handler.headers.get("Sec-WebSocket-Key", "")
    try:
        valid_key = len(base64.b64decode(key, validate=True)) == 16
    except (ValueError, base64.binascii.Error):
        valid_key = False
    if (handler.headers.get("Upgrade", "").lower() != "websocket"
            or "upgrade" not in handler.headers.get("Connection", "").lower()
            or handler.headers.get("Sec-WebSocket-Version") != "13" or not valid_key):
        handler.send_error(426, "WebSocket upgrade required")
        return
    accept = base64.b64encode(hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest()).decode()
    handler.send_response(101, "Switching Protocols")
    handler.send_header("Upgrade", "websocket")
    handler.send_header("Connection", "Upgrade")
    handler.send_header("Sec-WebSocket-Accept", accept)
    handler.end_headers()
    handler.close_connection = True
    handler.connection.settimeout(45)
    peer = Peer(handler)
    room = HUB.room(room_name)
    joined = False
    try:
        while True:
            a, b = read_exact(handler.rfile, 2)
            opcode = a & 0x0F
            if not (a & 0x80) or not (b & 0x80):
                break  # Reject fragmented and unmasked client frames.
            count = b & 0x7F
            if count == 126:
                count = struct.unpack("!H", read_exact(handler.rfile, 2))[0]
            elif count == 127:
                count = struct.unpack("!Q", read_exact(handler.rfile, 8))[0]
            if count > MAX_FRAME_BYTES:
                break
            mask = read_exact(handler.rfile, 4)
            raw = read_exact(handler.rfile, count)
            data = bytes(v ^ mask[i % 4] for i, v in enumerate(raw))
            if opcode == 8:
                break
            if opcode == 9:
                peer.send(data, 10)
                continue
            if opcode != 1:
                continue
            try:
                msg = json.loads(data.decode("utf8"))
            except (UnicodeError, ValueError):
                continue
            if not isinstance(msg, dict):
                continue
            if not joined:
                if msg.get("type") != "join":
                    continue
                joined = room.joined(peer, msg.get("name", "Player"), msg.get("map", "city"))
                if not joined:
                    peer.send({"type": "error", "message": "Комната заполнена (максимум 10 игроков)"})
                    break
            else:
                room.process(peer, msg)
    except (ConnectionError, OSError, TimeoutError):
        pass
    finally:
        if joined:
            room.left(peer)
        try:
            handler.connection.close()
        except OSError:
            pass
