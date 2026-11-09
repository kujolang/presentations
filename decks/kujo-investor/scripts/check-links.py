from pathlib import Path
import re,urllib.request,concurrent.futures,json
p=Path(__file__).resolve().parents[1]
urls=sorted(set(re.findall(r'href="(https://[^"]+)"',(p/'assets/appendix.html').read_text())))
def check(url):
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as r:return {'url':url,'status':r.status,'final':r.url}
 except Exception as e:return {'url':url,'error':str(e)}
results=list(concurrent.futures.ThreadPoolExecutor(max_workers=5).map(check,urls));(p/'qa/external-links.json').write_text(json.dumps(results,indent=2));print(json.dumps([r for r in results if 'error' in r],indent=2));print(f'{len(results)} URLs checked')
