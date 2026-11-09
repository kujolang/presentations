from pathlib import Path
import json,sys,hashlib
p=Path(__file__).resolve().parents[1]; stage=sys.argv[1];d=json.loads((p/'deck.json').read_text());a=json.loads((p/'finance/assumptions.json').read_text());c=json.loads((p/'research/capabilities.json').read_text())
assert len(d['slides'])==18
assert len(json.loads((p/'investor-notes.json').read_text())['notes'])==18
if stage in ['A','G']:
 assert len(c)==14
 for claim in c:assert all(claim[k] for k in ['source','commit','status','limitations','confidence','accessed'])
 assert a['scenarios'][1]['raise']/a['postMoney']==.2
 for s in a['scenarios']:assert abs(sum(s[k] for k in ['engineering','infrastructure','distribution','operations','reserves'])-1)<.00001
 for file,expected in json.loads((p/'assets/evidence/manifest.json').read_text()).items():assert hashlib.sha256((p/'assets/evidence'/file).read_bytes()).hexdigest()==expected,file
if stage in ['B','F','G']:
 assert 'before the language' in d['slides'][8]['title']
 assert 'data not supplied' in json.dumps(d['slides'][14])
 assert 'assumptions' in json.dumps(d['slides'][16])
if stage in ['C','E','G']:
 r=json.loads((p/'qa/browser-report.json').read_text());assert r['pass'],r
 assert len(list((p/'qa/screenshots').glob('desktop-*.png')))>=18
if stage=='D':assert (p.parents[1]/'output/kujo-investor/18/index.html').exists()
review=p/'loops'/f'{stage}-review.md'
assert review.exists() and 'Disposition: accepted' in review.read_text()
print(f'Loop {stage}: deterministic evidence checks passed. Qualitative judgment is in {review.name}; this gate does not automate investor judgment.')
