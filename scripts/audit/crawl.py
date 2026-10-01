"""Compare generated deck artifacts. Audit-only dependency: beautifulsoup4."""
import argparse, csv, hashlib, json, collections, urllib.request, urllib.error
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
from bs4 import BeautifulSoup
p=argparse.ArgumentParser(); p.add_argument('phase',choices=['baseline','after']); p.add_argument('root'); p.add_argument('--audit',default='seo-audit/2026-10-01'); p.add_argument('--origin',default='https://presentations.kujolang.ai'); p.add_argument('--local',required=True); a=p.parse_args()
root=Path(a.root).resolve(); out=Path(a.audit); origin=a.origin.rstrip('/')
def read_csv(name):
 with (out/name).open() as f: return list(csv.reader(f))[0]
def save(name,rows,append=False):
 fields=read_csv(name)
 old=[]
 if append:
  with (out/name).open() as f: old=[r for r in csv.DictReader(f) if r.get('phase')!=a.phase]
 with (out/name).open('w') as f:
  w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore'); w.writeheader(); w.writerows(old+rows)
def path_for(url):
 path=unquote(urlsplit(url).path).lstrip('/'); f=root/path
 if f.is_dir(): f=f/'index.html'
 try: f.resolve().relative_to(root)
 except ValueError: return None
 return f
statuses={}
def status(path):
 if path not in statuses:
  try:
   with urllib.request.urlopen(a.local.rstrip('/')+path,timeout=10) as response: statuses[path]=response.status
  except urllib.error.HTTPError as e: statuses[path]=e.code
  except Exception: statuses[path]='UNREACHABLE'
 return statuses[path]
htmls=sorted(root.rglob('*.html')); rows=[]; metadata=[]; images=[]; links=[]; schemas=[]; graph={}; raw=[]
sitemap=(root/'sitemap.xml').read_text() if (root/'sitemap.xml').exists() else ''
for f in htmls:
 rel=f.relative_to(root).as_posix(); path='/'+rel.removesuffix('index.html') if rel.endswith('index.html') else '/'+rel
 url=origin+path; soup=BeautifulSoup(f.read_text(),'html.parser'); meta=lambda name: (soup.find('meta',attrs={'name':name}) or {}).get('content',''); prop=lambda name:(soup.find('meta',attrs={'property':name}) or {}).get('content','')
 canonical=(soup.find('link',rel='canonical') or {}).get('href',''); title=soup.title.get_text(' ',strip=True) if soup.title else ''; desc=meta('description'); robots=meta('robots'); headings=[h for h in soup.find_all(['h1','h2','h3']) if not h.find_parent(attrs={'aria-hidden':'true'})]; h1=[h.get_text(' ',strip=True) for h in headings if h.name=='h1']; page_type='slide' if path.strip('/').isdigit() else path.strip('/') or 'overview'
 ld=[]; errors=[]
 for s in soup.find_all('script',type='application/ld+json'):
  try:
   data=json.loads(s.string or s.get_text()); ld.extend(data if isinstance(data,list) else data.get('@graph',[data]))
  except Exception as e: errors.append(str(e))
 types=[d.get('@type','') for d in ld]; schemas.append(dict(phase=a.phase,url=url,schema_types=json.dumps(types),json_ld_blocks=len(ld),valid_json=not errors,visible_match='reviewed' if ld else 'not present',rich_result_eligible='No rich-result eligibility claimed',issues=';'.join(errors)))
 outbound=[]; external=[]; broken=[]
 for link in soup.find_all('a',href=True):
  dest=urljoin(url,link['href']); parts=urlsplit(dest)
  if parts.scheme not in ['http','https']:continue
  internal=parts.netloc==urlsplit(origin).netloc
  code=status(parts.path) if internal else 'NOT VERIFIED'
  item=dict(phase=a.phase,source_url=url,destination_url=dest,anchor_text=link.get_text(' ',strip=True),link_context=link.parent.name,http_status=code,final_url=dest,chain_length=0,verification='local HTTP' if internal else 'external inventory',rel=' '.join(link.get('rel',[])))
  links.append((internal,item)); (outbound if internal else external).append(dest)
  if isinstance(code,int) and code>=400:broken.append(dest)
 graph[url]=[origin+urlsplit(d).path for d in outbound]
 for img in soup.find_all('img'):
  dest=urljoin(url,img.get('src','')); target=path_for(dest); exists=bool(target and target.is_file()); dimensions=img.get('width') and img.get('height')
  images.append(dict(phase=a.phase,page_url=url,image_url=dest,alt_text=img.get('alt',''),alt_present=img.has_attr('alt'),decorative=img.get('alt')=='',width=img.get('width',''),height=img.get('height',''),loading=img.get('loading','eager'),format=Path(urlsplit(dest).path).suffix,local_exists=exists,file_bytes=target.stat().st_size if exists else 0,issues='' if dimensions else 'no intrinsic dimensions; fixed canvas/crop reserves space'))
 for script in soup(['script','style']):script.decompose()
 text=soup.get_text(' ',strip=True); code=status(path); indexable=code==200 and 'noindex' not in robots.lower(); local_canonical=canonical.startswith(origin+'/'); target=path_for(canonical) if local_canonical else None
 row=dict(phase=a.phase,url=url,source_file=rel,page_type=page_type,local_status=code,production_status='DNS_NXDOMAIN' if a.phase=='baseline' else 'see production receipts',indexable=indexable,robots_directives=robots,canonical=canonical,canonical_target_status=status(urlsplit(canonical).path) if local_canonical else 'WRONG_OR_MISSING_ORIGIN',title=title,title_length=len(title),meta_description=desc,description_length=len(desc),h1=' | '.join(h1),heading_structure=json.dumps([(h.name,h.get_text(' ',strip=True)) for h in headings]),word_count=len(text.split()),lang=(soup.html or {}).get('lang',''),schema_types=json.dumps(types),internal_outbound_links=len(outbound),external_outbound_links=len(external),broken_internal_links=len(broken),broken_external_links='NOT VERIFIED',image_count=len(soup.find_all('img')),missing_alt=sum(not i.has_attr('alt') for i in soup.find_all('img')),missing_dimensions=sum(not(i.get('width') and i.get('height')) for i in soup.find_all('img')),sitemap_included=url in sitemap,content_hash=hashlib.sha256(text.encode()).hexdigest(),issues=';'.join((['canonical origin mismatch'] if not local_canonical and indexable else [])+(['missing description'] if not desc else [])+(['broken internal links'] if broken else [])))
 rows.append(row); metadata.append(dict(row,og_title=prop('og:title'),og_description=prop('og:description'),og_url=prop('og:url'),og_type=prop('og:type'),og_image=prop('og:image'),twitter_card=meta('twitter:card'))); raw.append(dict(url=url,h1_count=len(h1),raw_h1_count=len(soup.find_all('h1')),json_ld_errors=errors,broken_links=broken))
depths={origin+'/':0}; queue=collections.deque(depths)
while queue:
 u=queue.popleft()
 for dest in graph.get(u,[]):
  if dest not in depths:depths[dest]=depths[u]+1;queue.append(dest)
counts={key:collections.Counter(r[key] for r in rows) for key in ['title','meta_description']}
for row in rows:
 row.update(internal_inbound_links=sum(row['url'] in targets for targets in graph.values()),page_depth=depths.get(row['url'],''),orphan=row['url'] not in depths,duplicate_title=counts['title'][row['title']]>1,duplicate_description=counts['meta_description'][row['meta_description']]>1)
for item in metadata:
 row=next(r for r in rows if r['url']==item['url']); item.update(duplicate_title=row['duplicate_title'],duplicate_description=row['duplicate_description'])
save(a.phase+'.csv',rows); save('site-inventory.csv',rows,True); save('metadata-audit.csv',metadata,True); save('image-audit.csv',images,True); save('schema-audit.csv',schemas,True); save('internal-links.csv',[r for internal,r in links if internal],True); save('external-links.csv',[r for internal,r in links if not internal],True); save('indexability.csv',rows,True); save('crawlability.csv',rows,True)
save('broken-links.csv',[dict(r,link_type='internal',evidence='local HTTP',recommended_action='correct route or relative path') for internal,r in links if internal and isinstance(r['http_status'],int) and r['http_status']>=400],True)
summary=dict(pages=len(rows),indexable=sum(r['indexable'] for r in rows),canonical_origin_mismatches=sum(r['indexable'] and not r['canonical'].startswith(origin+'/') for r in rows),missing_titles=sum(not r['title'] for r in rows),missing_descriptions=sum(not r['meta_description'] for r in rows),duplicate_title_pages=sum(r['duplicate_title'] for r in rows),duplicate_description_pages=sum(r['duplicate_description'] for r in rows),broken_internal_links=sum(r['broken_internal_links'] for r in rows),orphans=sum(r['orphan'] for r in rows),missing_alt=sum(r['missing_alt'] for r in rows),missing_dimensions=sum(r['missing_dimensions'] for r in rows),schema_pages=sum(bool(json.loads(r['schema_types'])) for r in rows),schema_parse_errors=sum(len(r['json_ld_errors']) for r in raw),sitemap_pages=sum(r['sitemap_included'] for r in rows),pages_over_three_clicks=sum(isinstance(r['page_depth'],int) and r['page_depth']>3 for r in rows),h1_problems=sum(r['h1_count']!=1 for r in raw),broken_media=sum(not i['local_exists'] for i in images))
(out/(a.phase+'-summary.json')).write_text(json.dumps(summary,indent=2)+'\n'); (out/'raw'/(a.phase+'-crawl.json')).write_text(json.dumps(dict(pages=raw,http=statuses),indent=2)+'\n'); print(json.dumps(summary,indent=2))
