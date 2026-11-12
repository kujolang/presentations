"""Reproducible local inventory + bounded live probes. No rankings inferred."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,csv,hashlib,re,sys,urllib.parse,urllib.request,concurrent.futures,datetime,tarfile,collections
repo=Path(__file__).resolve().parents[3];audit=repo/'seo-audit/2026-11-11';origin='https://invest.kujolang.ai';phase=sys.argv[1];root=Path(sys.argv[2]).resolve();NA='NOT AVAILABLE — DATA ACCESS REQUIRED'
def save(name,rows,fields=None):
 with (audit/name).open('w') as f:
  w=csv.DictWriter(f,fieldnames=fields or (list(rows[0]) if rows else ['status']),extrasaction='ignore',lineterminator='\n');w.writeheader();w.writerows(rows)
def route(file):
 rel='/'+str(file.relative_to(root));return rel[:-10] if rel.endswith('index.html') else rel[:-5] if rel.endswith('.html') and rel!='/404.html' else rel
files=list(root.rglob('*.html'));pages={origin+route(f):f for f in files};sitemap=set(re.findall(r'<loc>(.*?)</loc>',(root/'sitemap.xml').read_text()));records=[];links=[];images=[];schema=[]
def local(url):
 path=urllib.parse.urlparse(url).path
 if path in ['/1','/1/']:return root/'index.html'
 target=root/path.lstrip('/')
 for p in [target,target/'index.html',Path(str(target)+'.html')]:
  if p.is_file():return p
 return None
for url,file in pages.items():
 raw=file.read_text();s=BeautifulSoup(raw,'html.parser');meta=lambda n:(s.find('meta',attrs={'name':n}) or {}).get('content','');can=(s.find('link',rel='canonical') or {}).get('href','');title=s.title.get_text(' ',strip=True) if s.title else '';desc=meta('description');heads=[x.name+': '+x.get_text(' ',strip=True) for x in s.find_all(re.compile('^h[1-6]$'))];types=[];errs=[]
 for block in s.select('script[type="application/ld+json"]'):
  try:
   data=json.loads(block.string or block.get_text());types.extend(x.get('@type','') for x in (data if isinstance(data,list) else data.get('@graph',[data])))
  except Exception as e:errs.append(str(e))
 schema.append({'phase':phase,'url':url,'types':json.dumps(types),'parse_errors':json.dumps(errs),'assessment':'WebPage is appropriate; rich-result eligibility not implied'})
 for a in s.find_all('a',href=True):
  dest=urllib.parse.urljoin(url,a['href']);u=urllib.parse.urlparse(dest)
  if u.scheme not in ['http','https']:continue
  internal=u.netloc==urllib.parse.urlparse(origin).netloc;target=local(dest) if internal else None
  status=200 if target else 404 if internal else NA
  frag=u.fragment
  if internal and target and frag and target.suffix=='.html' and not BeautifulSoup(target.read_text(),'html.parser').find(id=frag):status='missing-fragment'
  links.append({'phase':phase,'source_url':url,'destination_url':dest,'anchor_text':a.get_text(' ',strip=True),'link_context':'internal' if internal else 'external','http_status':status,'final_url':dest,'chain_length':0,'verification':'static target' if internal else 'pending HTTP probe','rel':' '.join(a.get('rel',[])),'recommended_action':'repair' if status in [404,'missing-fragment'] else ''})
 for im in s.find_all('img'):
  dest=urllib.parse.urljoin(url,im.get('src',''));target=local(dest);images.append({'phase':phase,'url':url,'src':dest,'alt':im.get('alt',''),'missing_alt':'alt' not in im.attrs,'missing_dimensions':not (im.get('width') and im.get('height')),'bytes':target.stat().st_size if target else '', 'status':200 if target else 404,'loading':im.get('loading','eager')})
 for el in s(['script','style']):el.decompose()
 records.append({'phase':phase,'url':url,'source_file':str(file.relative_to(root)),'page_type':'slide' if re.search(r'/\d+/$',url) or url==origin+'/' else 'edition','local_status':404 if url.endswith('/404.html') else 200,'production_status':NA,'indexable':'noindex' not in meta('robots') and not url.endswith('/404.html'),'robots_directives':meta('robots'),'canonical':can,'canonical_target_status':200 if local(can) else 404,'title':title,'title_length':len(title),'meta_description':desc,'description_length':len(desc),'h1':' | '.join(x.get_text(' ',strip=True) for x in s.find_all('h1')),'h1_count':len(s.find_all('h1')),'heading_structure':json.dumps(heads),'word_count':len(s.get_text(' ',strip=True).split()),'lang':s.html.get('lang',''),'published_date':'','modified_date':'','author':'','breadcrumbs':bool(s.find(attrs={'aria-label':'Breadcrumb'})),'schema_types':json.dumps(types),'schema_errors':len(errs),'internal_inbound_links':0,'internal_outbound_links':0,'external_outbound_links':0,'broken_internal_links':0,'broken_external_links':NA,'image_count':len(s.find_all('img')),'missing_alt':sum(x['missing_alt'] for x in images if x['url']==url),'missing_dimensions':sum(x['missing_dimensions'] for x in images if x['url']==url),'page_depth':'','orphan':False,'sitemap_included':url in sitemap,'duplicate_title':False,'duplicate_description':False,'content_hash':hashlib.sha256(raw.encode()).hexdigest(),'issues':''})
depths={origin+'/':0};changed=True
while changed:
 changed=False
 for l in links:
  dest=l['destination_url'].split('#')[0]
  if l['source_url'] in depths and dest in pages and dest not in depths:depths[dest]=depths[l['source_url']]+1;changed=True
for r in records:
 r['internal_inbound_links']=sum(l['destination_url'].split('#')[0]==r['url'] and l['source_url']!=r['url'] for l in links);r['internal_outbound_links']=sum(l['source_url']==r['url'] and l['link_context']=='internal' for l in links);r['external_outbound_links']=sum(l['source_url']==r['url'] and l['link_context']=='external' for l in links);r['broken_internal_links']=sum(l['source_url']==r['url'] and l['http_status'] in [404,'missing-fragment'] for l in links);r['orphan']=r['url'] not in depths;r['page_depth']=depths.get(r['url'],'unreachable');r['duplicate_title']=sum(x['title']==r['title'] for x in records)>1;r['duplicate_description']=sum(x['meta_description']==r['meta_description'] for x in records)>1
save(phase+'.csv',records);save(phase+'-links.csv',links);save(phase+'-images.csv',images);save(phase+'-schema.csv',schema)
index=[r for r in records if r['indexable']];summary={'pages':len(records),'indexable_pages':len(index),'missing_titles':sum(not r['title'] for r in index),'duplicate_titles':sum(r['duplicate_title'] for r in index),'missing_descriptions':sum(not r['meta_description'] for r in index),'duplicate_descriptions':sum(r['duplicate_description'] for r in index),'missing_canonicals':sum(not r['canonical'] for r in index),'h1_problems':sum(r['h1_count']!=1 for r in index),'broken_internal_links':sum(r['broken_internal_links'] for r in records),'orphans_indexable':sum(r['orphan'] for r in index),'deeper_than_three':sum(isinstance(r['page_depth'],int) and r['page_depth']>3 for r in index),'missing_alt':sum(r['missing_alt'] for r in records),'missing_dimensions':sum(r['missing_dimensions'] for r in records),'schema_parse_errors':sum(r['schema_errors'] for r in records),'schema_coverage':sum(r['schema_types']!='[]' for r in index),'sitemap_noindex':sum(r['sitemap_included'] and not r['indexable'] for r in records),'field_performance':NA,'rankings':NA,'AI_citations':NA,'scores':'Not assigned: no platform performance or citation access'}
(audit/(phase+'-summary.json')).write_text(json.dumps(summary,indent=2)+'\n')
if phase=='after':
 for name,data in [('site-inventory.csv',records),('metadata-audit.csv',records),('schema-audit.csv',schema),('image-audit.csv',images),('internal-links.csv',[l for l in links if l['link_context']=='internal']),('broken-links.csv',[l for l in links if l['http_status'] in [404,'missing-fragment']]),('indexability.csv',records),('crawlability.csv',records)]:save(name,data)
 save('content-audit.csv',[{'url':r['url'],'purpose':'Investor technical and commercial diligence','audience':'Technical seed investors','intent':'Understand Kujo evidence and proposed business','status':'Fact, hypothesis and scenario labels reviewed','action':'Founder approval required before public revision'} for r in index])
 save('keyword-map.csv',[{'url':r['url'],'topic':r['title'],'intent':'branded investor diligence','primary_theme':'Kujo investor evidence','competing_url':'reading edition repeats slide content intentionally','action':'retain useful accessible editions'} for r in index])
print(json.dumps(summary))
if '--live' not in sys.argv:sys.exit()
# Read-only production probes, retain raw headers and responses. UA spoofing is not verified bot-origin traffic.
external=sorted(set(l['destination_url'].split('#')[0] for l in links if l['link_context']=='external'))
variants=[origin+'/', 'http://invest.kujolang.ai/', 'https://www.invest.kujolang.ai/',origin+'/1/?probe=seo',origin+'/2',origin+'/missing-audit-20261111',origin+'/robots.txt',origin+'/sitemap.xml']
jobs=[(u,'Mozilla/5.0') for u in sorted(set(pages)|set(variants)|set(external))]+[(origin+path,ua) for ua in ['Googlebot','bingbot','OAI-SearchBot','ChatGPT-User','GPTBot'] for path in ['/','/robots.txt','/sitemap.xml']]
def fetch(job):
 url,ua=job;key=hashlib.sha256((url+ua).encode()).hexdigest()[:16];row={'url':url,'user_agent':ua,'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'receipt':key}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':ua})
  with urllib.request.urlopen(req,timeout=15) as r:body=r.read();row.update(status=r.status,final_url=r.url,headers=dict(r.headers))
 except urllib.error.HTTPError as e:body=e.read();row.update(status=e.code,final_url=e.url,headers=dict(e.headers))
 except Exception as e:body=b'';row.update(status='unavailable',error=str(e))
 (audit/'raw'/f'{key}.body').write_bytes(body);(audit/'raw'/f'{key}.json').write_text(json.dumps(row,indent=2));return row
results=list(concurrent.futures.ThreadPoolExecutor(12).map(fetch,jobs));(audit/'production-probes.json').write_text(json.dumps(results,indent=2))
save('crawler-access.csv',[{'url':r['url'],'user_agent':r['user_agent'],'status':r['status'],'verification':'HTTP user-agent probe only; real bot IP access unverified','receipt':r['receipt']} for r in results if r['user_agent']!='Mozilla/5.0'])
save('redirects.csv',[{'phase':'production-before','source_url':r['url'],'source_variant':r['url'],'http_status':r['status'],'target_url':r.get('final_url',''),'chain_length':'not captured by urllib','final_status':r['status'],'canonical_target':origin,'query_preserved':'probe retained in final URL' if 'probe=seo' in r.get('final_url','') else 'not applicable or unverified','verification':'followed HTTP probe; see raw headers','issues':r.get('error','')} for r in results if r['url'] in variants])
for l in links:
 if l['link_context']=='external':
  r=next((r for r in results if r['url']==l['destination_url'].split('#')[0]),{});l['http_status']=r.get('status',NA);l['final_url']=r.get('final_url','');l['verification']='indeterminate/access blocked' if l['http_status'] in [401,403,405,429,'unavailable'] else 'HTTP GET';l['recommended_action']='review' if l['http_status']==404 else ''
save('external-links.csv',[l for l in links if l['link_context']=='external'])
print('live probes',len(results))
