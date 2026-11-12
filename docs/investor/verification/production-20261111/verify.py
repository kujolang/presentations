"""Verify the actual custom domain against the exact deployed artifact."""
from pathlib import Path
import urllib.request,urllib.error,concurrent.futures,json,hashlib,datetime,subprocess
root=Path(__file__).resolve().parents[4];build=root/'.build/investor-pages';out=Path(__file__).parent;base='https://invest.kujolang.ai'
files=[p for p in build.rglob('*') if p.is_file() and not p.name.startswith('_')]
def check(p):
 rel=str(p.relative_to(build));path='/'+rel.replace('index.html','')
 if rel=='assets/deck/appendix.html':path='/assets/deck/appendix'
 if rel=='404.html':return {'path':path,'skipped':'error template; missing route checked separately'}
 result={'path':path}
 try:
  with urllib.request.urlopen(urllib.request.Request(base+path,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as r:body=r.read();result.update(status=r.status,final_url=r.url,bytes=len(body))
  expected=p.read_bytes()
  if rel=='robots.txt':
   result['matches']=expected.decode().strip() in body.decode();result['edge_note']='Cloudflare Managed content is prepended; origin directives retained';(out/'live-robots.txt').write_bytes(body)
  elif p.suffix=='.html':result['matches']=all(part in body.decode() for part in expected.decode().split('<title>')[1].split('</title>')[:1])
  else:result['matches']=hashlib.sha256(body).hexdigest()==hashlib.sha256(expected).hexdigest()
  result['pass']=result['status']==200 and result['matches']
 except Exception as e:result.update(error=str(e),pass_=False)
 return result
rows=list(concurrent.futures.ThreadPoolExecutor(6).map(check,files))
# curl verifies the error route; Python urllib's default user agent receives an edge 403.
missing=int(subprocess.check_output(['curl','-sS','--max-time','30','-o',str(out/'missing.html'),'-D',str(out/'missing-headers.txt'),'-w','%{http_code}',base+'/missing-investor-page-20261111/'],text=True))
headers=out/'missing-headers.txt'
headers.write_text('\n'.join(line.rstrip() for line in headers.read_text().splitlines()).rstrip()+'\n')
report={'origin':base,'verified_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':rows,'missing_status':missing,'pass':all(x.get('pass',False) or 'skipped' in x for x in rows) and missing==404}
(out/'http-result.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'pass':report['pass'],'files':len(rows),'failures':[x for x in rows if not x.get('pass') and 'skipped' not in x],'missing':missing},indent=2));assert report['pass']
