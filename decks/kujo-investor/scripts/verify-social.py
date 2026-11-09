"""Validate every published HTML page and its real PNG, locally or over HTTPS."""
import concurrent.futures,hashlib,json,os,subprocess,sys
from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
site=Path('.build/investor-pages');origin='https://invest.kujolang.ai';live='--live' in sys.argv
out=Path('decks/kujo-investor/qa/social');out.mkdir(exist_ok=True)
def request(url,ua='facebookexternalhit/1.1'):
 args=['curl','-sS','-L','--max-time','30','-A',ua,'-w','\n%{http_code}\t%{content_type}',url]
 if os.environ.get('AUDIT_RESOLVE'):args+=['--resolve',os.environ['AUDIT_RESOLVE']]
 p=subprocess.run(args,capture_output=True);assert p.returncode==0,p.stderr.decode();body,tail=p.stdout.rsplit(b'\n',1);status,kind=tail.decode().split('\t');assert status=='200',(url,status);return body,kind

def check(file):
 rel=file.relative_to(site).as_posix();route='/'+rel.removesuffix('index.html') if rel.endswith('index.html') else '/'+rel
 html,kind=request(origin+route) if live else (file.read_bytes(),'text/html')
 soup=BeautifulSoup(html,'html.parser');tags=soup.select('meta[property="og:image"]');assert len(tags)==1,(route,'og:image count',len(tags))
 url=tags[0]['content'];assert url.startswith(origin+'/assets/deck/social/') and url.endswith('.png')
 assert soup.select_one('meta[name="twitter:image"]')['content']==url
 assert soup.select_one('meta[name="twitter:card"]')['content']=='summary_large_image'
 assert soup.select_one('meta[property="og:image:width"]')['content']=='1200'
 assert soup.select_one('meta[property="og:image:height"]')['content']=='630'
 assert soup.select_one('meta[property="og:image:alt"]')['content']
 expected=(site/urlsplit(url).path.lstrip('/')).read_bytes()
 png,mime=request(url) if live else (expected,'image/png');assert mime.startswith('image/png'),mime
 im=Image.open(BytesIO(png));assert im.size==(1200,630) and im.format=='PNG'
 assert png==expected,(route,'deployed image mismatch')
 return dict(route=route,image=url,bytes=len(png),width=im.width,height=im.height,mime=mime,sha256=hashlib.sha256(png).hexdigest(),status='pass')
files=list(site.rglob('*.html'));results=list(concurrent.futures.ThreadPoolExecutor(6).map(check,files));assert len(results)==24
report={'mode':'production' if live else 'local','userAgent':'facebookexternalhit/1.1' if live else None,'dnsOverride':os.environ.get('AUDIT_RESOLVE'),'pages':len(results),'uniqueImages':len({r['image'] for r in results}),'checks':results,'pass':True,'limits':'Crawler-UA check is not a live Facebook/LinkedIn/X preview-cache purge or proof of provider-IP access.'}
(out/('production.json' if live else 'local.json')).write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='checks'}))
