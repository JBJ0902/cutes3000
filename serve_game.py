from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import webbrowser
ROOT=Path(__file__).resolve().parent/'dist'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        super().end_headers()
if __name__=='__main__':
    if not (ROOT/'app.js').exists(): raise SystemExit('dist/app.js missing. Extract the entire ZIP first.')
    try: server=ThreadingHTTPServer(('127.0.0.1',8000),Handler)
    except OSError: raise SystemExit('Port 8000 is in use. Stop the previous server with Ctrl+C, then start again.')
    print('CUTIES3000 expansion 2.0 | http://localhost:8000/ | Ctrl+C to stop',flush=True)
    webbrowser.open('http://localhost:8000/')
    try: server.serve_forever()
    except KeyboardInterrupt: server.server_close()
