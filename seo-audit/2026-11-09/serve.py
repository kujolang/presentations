from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory='.build/investor-pages',**kw)
 def do_GET(self):
  p=urlsplit(self.path)
  if p.path in ['/1','/1/']:
   self.send_response(301);self.send_header('Location','/'+('?' + p.query if p.query else ''));self.end_headers();return
  if p.path=='/assets/deck/appendix':self.path='/assets/deck/appendix.html'
  super().do_GET()
ThreadingHTTPServer(('127.0.0.1',8107),Handler).serve_forever()
