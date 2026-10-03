"""Verify deliverable picture identity, full decode, audio bounds and cue timing."""
import hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
file=ROOT/'output/release-complete.mp4'
def run(args):return subprocess.run(args,check=True,capture_output=True)
p=json.loads(run(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(file)]).stdout)
v=next(s for s in p['streams'] if s['codec_type']=='video')
a=next(s for s in p['streams'] if s['codec_type']=='audio')
assert len(p['streams'])==2
assert (v['width'],v['height'],v['nb_read_frames'],v['avg_frame_rate'])==(1920,1080,'360','24/1')
assert (a['codec_name'],a['sample_rate'],a['channels'])==('aac','48000',2)
assert abs(float(p['format']['duration'])-15)<.001
assert abs(float(a['duration'])-15)<.025
assert abs(float(a['start_time']))<.001
assert all(v[k]=='bt709' for k in ['color_space','color_transfer','color_primaries'])
run(['ffmpeg','-v','error','-xerror','-i',str(file),'-f','null','-'])
def picture_hash(f):return run(['ffmpeg','-v','error','-i',str(f),'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).stdout.decode().strip()
picture=picture_hash(file)
assert picture==picture_hash(ROOT/'output/release-silent.mp4')
r=run(['ffmpeg','-hide_banner','-i',str(file),'-vn','-af','loudnorm=I=-16:TP=-1.8:LRA=7:print_format=json','-f','null','-'])
loudness=json.loads(re.findall(r'\{[^{}]+\}',r.stderr.decode())[-1])
assert -17<float(loudness['input_i'])<-15,loudness
assert float(loudness['input_tp'])<=-1,loudness
mix=json.loads((ROOT/'audio/mix-receipt.json').read_text())
for cue in mix['voice']:
 assert cue['start']<cue['actualEnd']<=min(15,cue['end']+.05)
 assert .94<=cue['tempo']<=1.28
result={'ok':True,'file':str(file.relative_to(ROOT)),'duration':15,'frames':360,'pictureBitstreamIdentical':True,'pictureHash':picture,'audioCodec':'AAC','sampleRate':48000,'channels':2,'integratedLUFS':float(loudness['input_i']),'truePeakDBTP':float(loudness['input_tp']),'loudnessRangeLU':float(loudness['input_lra']),'narrationCuesVerified':len(mix['voice']),'fullDecode':'passed','sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'bytes':file.stat().st_size,'subjectiveListening':'Not independently auditioned by the assistant; review the delivered video for voice preference and pronunciation.'}
(ROOT/'output/audio-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
