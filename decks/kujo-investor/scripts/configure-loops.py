from pathlib import Path
import subprocess
p=Path(__file__).resolve().parents[1];root=p.parents[2]; init=root/'kujo-workflows/loop-engineering/scripts/init-repo-loop.sh'
criteria={'A':'Verify documented capability boundaries, source dates, model arithmetic and authentic evidence hashes.','B':'Verify 18-slide thesis, independent tooling adoption, buyer, business model and explicit missing traction.','C':'Review all slide screenshots for hierarchy, whitespace, brand, clipping and readable supporting detail.','D':'Build source through the official Kujo Presentations renderer with native modes and assets.','E':'Verify navigation, presenter, print/read, evidence, finance controls, responsive viewports, axe and console.','F':'Critique demand evidence, defensibility, market assumptions, founder attribution and capital-to-milestone logic.','G':'Resolve material presentation defects and repeat applicable technical/evidence gates.'}
for stage,obj in criteria.items():
 d=p/'loops'/stage;subprocess.run(['bash',str(init)],cwd=p,env={**__import__('os').environ,'LOOP_ENGINEERING_DIR':str(d)},check=True,capture_output=True)
 cmd=f'python3 scripts/gate.py {stage}'
 (d/'loop.yml').write_text(f'''objective: "{obj}"
max_iterations: 3
max_no_progress: 2
max_consecutive_failures: 2
allowed_actions:
  - read_files
  - edit_files
  - run_tests
blocked_actions:
  - deploy
  - destructive_cleanup
eval_gates:
  - id: evidence_and_review
    command: "{cmd}"
    required: true
commit:
  enabled: false
  push: false
''')
(p/'loops/README.md').write_text('''# Official Loop Engineering execution
The official Bash harness was inspected and run in demo mode, then initialized/configured separately for A–G. Configs cap iterations at 3 and repeated failures at 2. Stop success requires actual gate pass; external blockers stop without success. Each stage retains native context/action/diff/eval/verdict and ledger. Revisions before a gate are retained in review records. D uses LOOP_ACT_CMD for the native build; other stages run artifact gates after this assistant performs research, editing or judgment.

The installed harness does not conduct visual or investor judgment itself. Those are clearly identified assistant self-reviews in stage-review.md, using the generated PackWrite reviewer prompt. No independent investor or second-agent endorsement is claimed. The gate validates evidence presence/invariants, not persuasive quality. Manual review acceptance means the artifact is fit for founder review with disclosed diligence gaps; it does not establish validated commercial traction.
''')
