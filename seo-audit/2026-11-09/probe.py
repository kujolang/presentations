import subprocess,json,csv,concurrent.futures
from pathlib import Path
ROOT=Path(__file__).parent;origin='https://invest.kujolang.ai'
def probe(item):
 ua,url=item
 p=subprocess.run(['curl','-sS','-L','--resolve','invest.kujolang.ai:443:104.21.61.127','--resolve','invest.kujolang.ai:80:104.21.61.127','--max-time','30','-A',ua,'-D','-','-o','/dev/null','-w','\nRESULT %{http_code} %{url_effective} %{num_redirects}',url],capture_output=True,text=True)
 return dict(ua=ua,url=url,receipt=p.stdout,error=p.stderr)
bots=['Googlebot','bingbot','OAI-SearchBot','GPTBot','ChatGPT-User']
items=[(b,origin+p) for b in bots for p in ['/','/robots.txt','/sitemap.xml','/reading/','/assets/deck/appendix']]+[('KujoAudit/1.0',u) for u in ['http://invest.kujolang.ai/',origin+'/1',origin+'/1/',origin+'/1/?utm_source=audit',origin+'/2',origin+'/2/?utm_source=audit',origin+'/assets/deck/appendix.html',origin+'/missing-audit-route','https://www.invest.kujolang.ai/','https://kujo-investor.pages.dev/']]
results=list(concurrent.futures.ThreadPoolExecutor(8).map(probe,items));(ROOT/'raw/production-probes.json').write_text(json.dumps(results,indent=2))
with (ROOT/'crawler-access.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['phase','user_agent','url','final_status','evidence','limitations'])
 for r in results:
  if r['ua'] in bots:w.writerow(['after',r['ua'],r['url'],r['receipt'].split('RESULT ')[-1].split(' ')[0],'raw/production-probes.json','Spoofed user agent from audit IP; not proof of crawler-IP access. Existing permissive robots policy preserved.'])
with (ROOT/'redirects.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['phase','source_url','source_variant','http_status','target_url','chain_length','final_status','canonical_target','query_preserved','verification','issues'])
 for r in results:
  if r['ua']!='KujoAudit/1.0':continue
  receipt=r['receipt'];final=receipt.split('RESULT ')[-1].split();statuses=[x.split()[1] for x in receipt.splitlines() if x.startswith('HTTP/')];w.writerow(['after',r['url'],'host/path/query',statuses[0] if statuses else 'ERROR',final[1] if len(final)>1 else '',final[2] if len(final)>2 else '',final[0],origin,'utm_source=audit' in final[1] if len(final)>1 and '?' in r['url'] else 'N/A','curl; DNS override for canonical host; valid TLS',r['error']])
print('Saved',len(results),'production probes')
