"""Controlled checkout regression; real tools, deterministic correction, no model claim."""
from pathlib import Path
import subprocess,tempfile,json,shutil,hashlib,platform,sys,os
source=Path(__file__).resolve().parent
out=Path(sys.argv[1]).resolve();out.mkdir(parents=True,exist_ok=False)
ecosystem=Path(os.environ.get('KUJO_ECOSYSTEM',source.parents[3]))
kujo=shutil.which('kujo') or str(ecosystem/'kujo/target/release/kujo')
logs=[]
with tempfile.TemporaryDirectory(prefix='kujo-checkout-') as tmp:
 work=Path(tmp)
 def run(args):
  r=subprocess.run(args,cwd=work,text=True,capture_output=True)
  row={'command':args,'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr};logs.append(row);return row
 for name in ['checkout.py','test_checkout.py']:shutil.copy(source/name,work/name)
 for args in [['git','init','-q'],['git','config','user.name','Controlled demo'],['git','config','user.email','demo@example.invalid'],['git','add','.'],['git','commit','-qm','Checkout regression fixture']]:assert run(args)['exit']==0
 rev=run(['git','rev-parse','HEAD'])['stdout'].strip()
 # Same command without Kujo: a retained subprocess receipt for a fair evidence comparison.
 assert run(['python3','-m','unittest','-v'])['exit']==1
 assert run([kujo,'run',str(ecosystem/'casefile/casefile.kujo'),'--','capture','--name','before','--','python3','-m','unittest','-v'])['exit']==0
 bad=(work/'checkout.py').read_text();(out/'before.py').write_text(bad)
 (work/'checkout.py').write_text(bad.replace('if discounted >=','if subtotal_cents >='))
 (out/'change.patch').write_text(run(['git','diff'])['stdout'])
 assert run([kujo,'run',str(ecosystem/'casefile/casefile.kujo'),'--','capture','--name','after','--','python3','-m','unittest','-v'])['exit']==0
 suite={'name':'checkout-regression','version':'1.0.0','output_dir':'eval-results','tests':[{'name':'unchanged checkout tests','check':'command_succeeds','params':{'command':'python3 -m unittest -v'}}]}
 (work/'eval.json').write_text(json.dumps(suite,indent=2))
 assert run([kujo,'run',str(ecosystem/'eval/main.kujo'),'--','run','eval.json'])['exit']==0
 for name in ['checkout.py','test_checkout.py','eval.json']:shutil.copy(work/name,out/name)
 for name in ['.casefile','eval-results']:shutil.copytree(work/name,out/name.lstrip('.'))
 (out/'commands.json').write_text(json.dumps(logs,indent=2))
 (out/'environment.json').write_text(json.dumps({'revision':rev,'platform':platform.platform(),'python':sys.version,'kujo':run([kujo,'--version'])['stdout'].strip(),'fixture_source':'kujolang/kujo-hermes@bfa94add10a73d5bda6455dda54c36cb56d8f14c','trust':'Controlled local fixture; deterministic driver correction, no autonomous repair or production incident.'},indent=2))
(out/'REQUEST.md').write_text('Preserve free shipping eligibility on the original $50 subtotal when a 10% coupon is applied. Controlled fixture from Kujo Hermes; tests remain unchanged.\n')
(out/'DECISION.md').write_text('Accept this one-line correction for the three retained tests. CaseFile records execution; Eval runs the configured test gate. RunLedger is only a session receipt. No production release or efficiency claim.\n')
(out/'manifest.json').write_text(json.dumps({str(f.relative_to(out)):hashlib.sha256(f.read_bytes()).hexdigest() for f in out.rglob('*') if f.is_file()},indent=2))
print(out)
