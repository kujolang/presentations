import csv,json,hashlib,subprocess,sys,concurrent.futures,collections,os
from pathlib import Path
from urllib.parse import urljoin,urlsplit,urldefrag
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parent
phase=sys.argv[1]; site=Path(sys.argv[2]); origin='https://invest.kujolang.ai'
NA='NOT AVAILABLE — DATA ACCESS REQUIRED'
def save(name,rows,fields=None):
 fields=fields or (list(rows[0]) if rows else ['phase','status']);p=ROOT/name
 with p.open('w') as f:
  w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(rows)
def fetch(url,ua='KujoAudit/1.0'):
 p=subprocess.run(['curl','-sS','-L','--max-time','25','-A',ua,'-w','\n%{http_code}\t%{url_effective}\t%{num_redirects}\t%{time_starttransfer}',url]+(['--resolve',os.environ['AUDIT_RESOLVE']] if os.environ.get('AUDIT_RESOLVE') and urlsplit(url).hostname=='invest.kujolang.ai' else []),capture_output=True,text=True)
 body,_,tail=p.stdout.rpartition('\n');v=tail.split('\t')
 return {'url':url,'status':v[0] if len(v)==4 else 'ERROR','final':v[1] if len(v)==4 else url,'hops':v[2] if len(v)==4 else '', 'ttfb':v[3] if len(v)==4 else '', 'body':body,'error':p.stderr}
files=list(site.rglob('*.html'));pages={}
for f in files:
 rel=f.relative_to(site).as_posix();path='/'+rel.removesuffix('index.html') if rel.endswith('index.html') else '/'+rel
 if phase=='after' and path=='/assets/deck/appendix.html':path='/assets/deck/appendix'
 pages[origin+path]=(f,BeautifulSoup(f.read_text(),'html.parser'))
urls=list(pages)+[origin+'/robots.txt',origin+'/sitemap.xml',origin+'/audit-missing-20261109', 'http://invest.kujolang.ai/',origin+'/2?audit=1']
receipts=list(concurrent.futures.ThreadPoolExecutor(8).map(fetch,urls));lookup={r['url']:r for r in receipts}
(ROOT/'raw'/f'{phase}-http.json').write_text(json.dumps(receipts,indent=2))
links=[];images=[];rows=[];schemas=[]
sitemap=(site/'sitemap.xml').read_text(); inbound=collections.Counter();edges=collections.defaultdict(set)
for url,(f,s) in pages.items():
 for a in s.select('a[href]'):
  dest=urldefrag(urljoin(url,a['href']))[0]
  if not dest.startswith('http'):continue
  internal=dest.startswith(origin+'/'); edges[url].add(dest)
  if internal:inbound[dest]+=1
  links.append(dict(phase=phase,source_url=url,destination_url=dest,anchor_text=a.get_text(' ',strip=True),link_context='HTML anchor',http_status='',final_url='',chain_length='',verification='pending',rel=' '.join(a.get('rel',[])),recommended_action='',internal=internal))
 def meta(sel,attr='content'):
  t=s.select_one(sel);return t.get(attr,'') if t else ''
 canonical=meta('link[rel=canonical]','href');robots=meta('meta[name=robots]');title=s.title.get_text(' ',strip=True) if s.title else '';description=meta('meta[name=description]')
 types=[];errors=0
 for t in s.select('script[type="application/ld+json"]'):
  try:
   j=json.loads(t.string);types.extend([j.get('@type','')])
  except:errors+=1
 schemas.append(dict(phase=phase,url=url,types='|'.join(types),parse_errors=errors,alignment='WebPage metadata matches visible deck' if types else 'No structured data',rich_result='No eligibility claim'))
 for img in s.select('img'):
  images.append(dict(phase=phase,url=url,src=urljoin(url,img.get('src','')),alt=img.get('alt','MISSING'),width=img.get('width',''),height=img.get('height',''),loading=img.get('loading','eager')))
 h1=s.select('h1');r=dict(phase=phase,url=url,source_file=str(f),page_type='slide' if s.select_one('.p-viewer') else 'support',local_status=200,production_status=lookup[url]['status'],indexable='no' if 'noindex' in robots or '404' in url else 'yes',robots_directives=robots,canonical=canonical,canonical_target_status='',title=title,title_length=len(title),meta_description=description,description_length=len(description),h1=' | '.join(x.get_text(' ',strip=True) for x in h1),heading_structure='|'.join(x.name for x in s.select('h1,h2,h3')),word_count=len(s.get_text(' ',strip=True).split()),lang=s.html.get('lang',''),published_date='',modified_date='',author='',breadcrumbs='no',schema_types='|'.join(types),internal_outbound_links=sum(l['internal'] for l in links if l['source_url']==url),external_outbound_links=sum(not l['internal'] for l in links if l['source_url']==url),image_count=len(s.select('img')),missing_alt=len(s.select('img:not([alt])')),missing_dimensions=len(s.select('img:not([width]),img:not([height])')),sitemap_included=str(url in sitemap).lower(),content_hash=hashlib.sha256(f.read_bytes()).hexdigest(),issues=';'.join((['missing canonical'] if not canonical else [])+(['missing description'] if not description else [])+(['h1 count '+str(len(h1))] if len(h1)!=1 else [])))
 rows.append(r)
destinations=set(l['destination_url'] for l in links)|set(r['canonical'] for r in rows if r['canonical'])
extra=list(concurrent.futures.ThreadPoolExecutor(10).map(fetch,destinations-set(lookup)))
lookup.update({r['url']:r for r in extra});(ROOT/'raw'/f'{phase}-links-http.json').write_text(json.dumps(extra,indent=2))
depth={origin+'/':0};queue=[origin+'/']
while queue:
 u=queue.pop(0)
 for d in edges[u]:
  if d in pages and d not in depth:depth[d]=depth[u]+1;queue.append(d)
for l in links:
 r=lookup[l['destination_url']];l.update(http_status=r['status'],final_url=r['final'],chain_length=r['hops'],verification='blocked/indeterminate' if r['status'] in ['401','403','405','429','ERROR'] else 'HTTP GET')
for r in rows:
 r.update(internal_inbound_links=inbound[r['url']],page_depth=depth.get(r['url'],''),orphan=str(r['url'] not in depth).lower(),duplicate_title=sum(x['title']==r['title'] for x in rows)>1,duplicate_description=bool(r['meta_description']) and sum(x['meta_description']==r['meta_description'] for x in rows)>1,canonical_target_status=lookup.get(r['canonical'],{}).get('status',''),broken_internal_links=sum(l['internal'] and l['http_status']=='404' for l in links if l['source_url']==r['url']),broken_external_links=sum(not l['internal'] and l['http_status']=='404' for l in links if l['source_url']==r['url']))
fields=next(csv.reader((ROOT/'baseline.csv').open()));save(phase+'.csv',rows,fields)
summary=dict(pages=len(rows),indexable=sum(r['indexable']=='yes' for r in rows),missing_titles=sum(not r['title'] for r in rows),duplicate_titles=sum(r['duplicate_title'] for r in rows),missing_descriptions=sum(not r['meta_description'] for r in rows),duplicate_descriptions=sum(r['duplicate_description'] for r in rows),missing_canonicals=sum(not r['canonical'] for r in rows),h1_problems=sum('h1 count' in r['issues'] for r in rows),orphans=sum(r['orphan']=='true' for r in rows),deep_pages=sum(isinstance(r['page_depth'],int) and r['page_depth']>3 for r in rows),missing_alt=sum(r['missing_alt'] for r in rows),missing_dimensions=sum(r['missing_dimensions'] for r in rows),schema_parse_errors=sum(x['parse_errors'] for x in schemas),schema_coverage=sum(bool(r['schema_types']) for r in rows),broken_internal=sum(l['internal'] and l['http_status']=='404' for l in links),broken_external=sum(not l['internal'] and l['http_status']=='404' for l in links),unique_link_destinations=len(destinations),field_performance=NA)
(ROOT/(phase+'-summary.json')).write_text(json.dumps(summary,indent=2))
for name,data in [('internal-links',[l for l in links if l['internal']]),('external-links',[l for l in links if not l['internal']]),('broken-links',[l for l in links if l['http_status']=='404']),('image-audit',images),('schema-audit',schemas),('metadata-audit',rows),('site-inventory',rows),('indexability',rows),('crawlability',rows)]:save(name+'.csv',data,list(links[0]) if name=='broken-links' else None)
print(json.dumps(summary,indent=2))
