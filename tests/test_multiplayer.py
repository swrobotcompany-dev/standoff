"""Integration smoke test: two real WebSocket clients share one LAN game."""
import base64
from functools import partial
from http.server import ThreadingHTTPServer
import json
import os
from pathlib import Path
import socket
import struct
import sys
import threading
import time
import unittest
import uuid

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from serve import Handler, ROOT
import server.multiplayer as multiplayer


def read_n(sock, n):
    result = b""
    while len(result) < n:
        block = sock.recv(n - len(result))
        if not block:
            raise ConnectionError("websocket closed unexpectedly")
        result += block
    return result


def connect_ws(port, room):
    sock = socket.create_connection(("127.0.0.1", port), timeout=4)
    key = base64.b64encode(os.urandom(16)).decode()
    req = (
        f"GET /ws?room={room} HTTP/1.1\r\nHost: localhost:{port}\r\n"
        f"Upgrade: websocket\r\nConnection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
    )
    sock.sendall(req.encode())
    head = b""
    while not head.endswith(b"\r\n\r\n"):
        head += read_n(sock, 1)
    if b"101 Switching Protocols" not in head:
        raise AssertionError(head.decode(errors="replace"))
    return sock


def send_json(sock, message):
    raw = json.dumps(message).encode()
    mask = os.urandom(4)
    if len(raw) < 126:
        header = bytes([0x81, 0x80 | len(raw)])
    else:
        header = bytes([0x81, 0x80 | 126]) + struct.pack("!H", len(raw))
    sock.sendall(header + mask + bytes(c ^ mask[i % 4] for i, c in enumerate(raw)))


def recv_json(sock):
    first, second = read_n(sock, 2)
    size = second & 0x7F
    if size == 126:
        size = struct.unpack("!H", read_n(sock, 2))[0]
    elif size == 127:
        size = struct.unpack("!Q", read_n(sock, 8))[0]
    raw = read_n(sock, size)
    if first & 0x0F != 1:
        return {}
    return json.loads(raw)


def until(sock, predicate, timeout=3):
    sock.settimeout(timeout)
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        packet = recv_json(sock)
        if predicate(packet):
            return packet
    raise AssertionError("Expected WebSocket event not received")


class MultiplayerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT)))
        cls.httpd.daemon_threads = True
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.httpd.server_address[1]

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def test_website_is_served(self):
        with socket.create_connection(("127.0.0.1", self.port), timeout=4) as sock:
            sock.sendall(b"GET /index.html HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n")
            result = sock.recv(4096)
            self.assertIn(b"200 OK", result)

    def test_two_clients_see_and_damage_each_other(self):
        previous = multiplayer.PREPARE_SECONDS
        multiplayer.PREPARE_SECONDS = 0.2
        name = uuid.uuid4().hex[:8]
        first = connect_ws(self.port, name)
        second = connect_ws(self.port, name)
        try:
            send_json(first, {"type": "join", "name": "Alice", "map": "desert"})
            a = until(first, lambda v: v.get("type") == "welcome")
            send_json(second, {"type": "join", "name": "Bob", "map": "city"})
            b = until(second, lambda v: v.get("type") == "welcome")
            self.assertNotEqual(a["id"], b["id"])
            starting = until(first, lambda v: v.get("type") == "snapshot" and len(v["players"]) == 2)
            self.assertEqual({p["team"] for p in starting["players"]}, {"T", "CT"})
            self.assertEqual(starting["map"], "desert")
            active = until(first, lambda v: v.get("type") == "snapshot" and v["phase"] == "active")
            self.assertEqual(active["round"], 1)
            send_json(first, {"type": "fire", "weapon": "m870",
                              "hits": [{"id": b["id"], "part": "torso", "pellets": 9}]})
            after = until(first, lambda v: v.get("type") == "snapshot" and v["phase"] == "ended")
            victim = next(p for p in after["players"] if p["id"] == b["id"])
            self.assertFalse(victim["alive"])
            self.assertEqual(victim["hp"], 0)
            self.assertEqual(after["scoreT"], 1)
        finally:
            first.close()
            second.close()
            multiplayer.PREPARE_SECONDS = previous


if __name__ == "__main__":
    unittest.main()
