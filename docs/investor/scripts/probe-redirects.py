from pathlib import Path
import subprocess,json,csv,concurrent.futures
p=Path('seo-audit/2026-11-11');urls=['http://invest.kujolang.ai/?audit=1','https://invest.kujolang.ai/1/?audit=1','https://invest.kujolang.ai/2','https://invest.kujolang.ai/assets/deck/appendix.html','https://www.invest.kujolang.ai/','https://invest.kujolang.ai/missing-audit-20261111']
def probe(pair):
 i,url=pair;dest=p/'raw'/f'redirect-{i}.headers';r=subprocess.run(['curl','-sS','-L','--max-redirs','5','--max-time','20','-D',str(dest),'-o','/dev/null','-w','%{http_code}\t%{url_effective}\t%{num_redirects}',url],capture_output=True,text=True);parts=r.stdout.split('\t');status,final,hops=parts if len(parts)==3 else ('unavailable','','');headers=dest.read_text() if dest.exists() else '';first=next((l for l in headers.splitlines() if l.startswith('HTTP/') and 'Connection established' not in l),'unavailable');return {'phase':'production-before','source_url':url,'source_variant':url,'http_status':first,'target_url':final,'chain_length':hops,'final_status':status,'canonical_target':'https://invest.kujolang.ai/','query_preserved':'yes' if 'audit=1' in final else 'not tested' if 'audit=1' not in url else 'no','verification':str(dest),'issues':r.stderr.strip()}
rows=list(concurrent.futures.ThreadPoolExecutor(6).map(probe,enumerate(urls)))
with (p/'redirects.csv').open('w') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
print(json.dumps(rows,indent=2))
