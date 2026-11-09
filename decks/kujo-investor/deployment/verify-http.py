from pathlib import Path
import urllib.request,urllib.error,concurrent.futures,json,sys,subprocess
root=Path(__file__).resolve().parents[3];base=sys.argv[1] if len(sys.argv)>1 else 'https://kujo-investor.pages.dev';build=root/'.build/investor-pages'
urls=['/'+str(p.relative_to(build)).replace('index.html','') for p in build.rglob('*') if p.is_file() and not p.name.startswith('_')]
def check(path):
 r=subprocess.run(['curl','-sL','--max-time','30','-o','/dev/null','-w','%{http_code} %{size_download} %{content_type}',base+path]+(['--resolve',sys.argv[2]] if len(sys.argv)>2 else []),capture_output=True,text=True)
 parts=r.stdout.split(' ',2);return {'path':path,'status':int(parts[0] or 0),'bytes':int(parts[1]) if len(parts)>1 else 0,'type':parts[2] if len(parts)>2 else ''}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(check,urls))
# A custom 404.html is served successfully as a file; nonexistent routes must remain 404.
missing=check('/no-such-investor-slide-qa/')
report={'base':base,'dnsOverride':sys.argv[2] if len(sys.argv)>2 else None,'pass':all(r['status']==200 for r in results) and missing['status']==404,'checks':results,'missingRoute':missing}
Path(__file__).with_name('http-verification.json').write_text(json.dumps(report,indent=2));print(json.dumps({'base':base,'dnsOverride':sys.argv[2] if len(sys.argv)>2 else None,'pass':report['pass'],'files':len(results),'failures':[r for r in results if r['status']!=200],'missing':missing['status']}));assert report['pass']
