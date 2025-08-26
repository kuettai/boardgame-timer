#!/usr/bin/env python3
import http.server
import socketserver
import socket
import os

PORT = 8000
DIRECTORY = "frontend"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        ip = get_ip()
        print("=" * 50)
        print("  BoardGame Timer Server Started")
        print("=" * 50)
        print(f"Local:   http://localhost:{PORT}")
        print(f"Network: http://{ip}:{PORT}")
        print()
        print(f"📱 iPad URL: http://{ip}:{PORT}")
        print()
        print("Press Ctrl+C to stop")
        print("=" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")