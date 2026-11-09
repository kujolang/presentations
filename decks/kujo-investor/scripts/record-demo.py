from pathlib import Path
import tempfile,subprocess,json,shutil,hashlib,platform
p=Path(__file__).resolve().parents[1]; root=p.parents[2]; k=str(root/'kujo/target/release/kujo'); out=p/'assets/evidence'; out.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='kujo-evidence-') as tmp:
 d=Path(tmp)
 def run(args):
  r=subprocess.run(args,cwd=d,text=True,capture_output=True); return {'command':args,'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
 run(['git','init','-q']); run(['git','config','user.email','fixture@example.invalid']); run(['git','config','user.name','Kujo recorded fixture'])
 bad='export function ownership(raise, postMoney) { return raise / (postMoney + raise) * 100; }\n'
 good='export function ownership(raise, postMoney) { return raise / postMoney * 100; }\n'
 test="import assert from 'node:assert/strict';\nimport { ownership } from './ownership.mjs';\nassert.equal(ownership(6,30),20);\nassert.equal(ownership(3,30),10);\nconsole.log('PASS: post-money ownership examples 6/30 and 3/30');\n"
 (d/'ownership.mjs').write_text(bad);(d/'test.mjs').write_text(test);run(['git','add','.']);run(['git','commit','-qm','Recorded fixture baseline'])
 logs=[]
 logs.append(run([k,'run',str(root/'casefile/casefile.kujo'),'--','capture','--name','before','--','node','test.mjs']))
 (d/'ownership.mjs').write_text(good); diff=run(['git','diff'])['stdout'];(out/'change.patch').write_text(diff)
 logs.append(run([k,'run',str(root/'casefile/casefile.kujo'),'--','capture','--name','after','--','node','test.mjs']))
 suite={'name':'investor-recorded-demo','version':'1.0.0','output_dir':'eval-results','tests':[{'name':'post-money ownership calculation','check':'command_succeeds','params':{'command':'node test.mjs'}},{'name':'fix uses post-money denominator','check':'file_contains','params':{'path':'ownership.mjs','expected':'raise / postMoney * 100'}}]}
 (d/'eval.json').write_text(json.dumps(suite,indent=2));logs.append(run([k,'run',str(root/'eval/main.kujo'),'--','run','eval.json']))
 for file in ['ownership.mjs','test.mjs','eval.json']:shutil.copy(d/file,out/file)
 for directory in ['.casefile','eval-results']:
  if (d/directory).exists():shutil.copytree(d/directory,out/directory.lstrip('.'),dirs_exist_ok=True)
 (out/'commands.json').write_text(json.dumps(logs,indent=2))
 (out/'REQUEST.md').write_text('# Recorded coding fixture\nCorrect a seed-round ownership function that incorrectly treats a post-money valuation as pre-money. For a $6M raise at $30M post-money, return 20%, and $3M returns 10%. Preserve before failure, diff and after output.\n\nThis is an assistant-authored, deliberately seeded local fixture executed on 2026-11-09. It is not a customer incident, live model benchmark, Workcell sandbox run, or independent attestation. CaseFile executes Node; Eval runs configured checks. No RunLedger proof is implied.\n')
 (out/'DECISION.md').write_text('# Review decision\nAccept the arithmetic correction for this fixture only after the Node assertions pass and Eval reports success. The earlier command failure remains in CaseFile evidence. This does not validate financing terms, SAFE conversion mechanics, or every financial input. No production release performed.\n')
 (out/'environment.json').write_text(json.dumps({'date':'2026-11-09','os':platform.platform(),'node':run(['node','--version'])['stdout'].strip(),'kujo':run([k,'--version'])['stdout'].strip(),'trust':'Local host; files are editable, hashes detect later changes only'},indent=2))
 files={str(f.relative_to(out)):hashlib.sha256(f.read_bytes()).hexdigest() for f in out.rglob('*') if f.is_file() and f.name!='manifest.json'}
 (out/'manifest.json').write_text(json.dumps(files,indent=2))
 print(json.dumps([{'exit':x['exit'],'stdout':x['stdout'][-1500:]} for x in logs],indent=2))
 if logs[-1]['exit']!=0:raise SystemExit(1)
