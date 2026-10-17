"""Запуск локального сервера Standoff Web 3D без сторонних пакетов."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

if __name__ == "__main__":
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", PORT), handler) as server:
        print(f"Standoff: http://127.0.0.1:{PORT}/ (Ctrl+C — остановить)", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен.")
