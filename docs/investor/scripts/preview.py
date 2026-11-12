from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import sys,os,functools
root=Path(sys.argv[1]).resolve()
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  path=urlsplit(self.path).path
  if path in ['/1','/1/']:
   self.send_response(301);self.send_header('Location','/'+(('?'+urlsplit(self.path).query) if urlsplit(self.path).query else ''));self.end_headers();return
  if not (root/path.lstrip('/')).exists() and (root/(path.lstrip('/')+'.html')).is_file():self.path=path+'.html'
  super().do_GET()
ThreadingHTTPServer(('127.0.0.1',int(sys.argv[2])),functools.partial(Handler,directory=str(root))).serve_forever()
