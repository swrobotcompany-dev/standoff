"""Standoff LAN server: static game assets + WebSocket multiplayer, no pip installs."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys

from server.multiplayer import websocket

ROOT = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/ws":
            websocket(self)
        else:
            super().do_GET()


if __name__ == "__main__":
    handler = partial(Handler, directory=str(ROOT))
    with ThreadingHTTPServer(("0.0.0.0", PORT), handler) as httpd:
        httpd.daemon_threads = True
        print(f"Standoff LAN: http://0.0.0.0:{PORT}/", flush=True)
        print("Откройте http://<IP-компьютера>:%s/ на обоих компьютерах" % PORT, flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен.")
