"""Fit cached narration to picture, carve the score dynamically, master and mux.
Offline: no provider requests, no credentials. Requires NumPy + FFmpeg.
"""
import hashlib,json,re,subprocess,wave,sys
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parent.parent
A=ROOT/'audio';SR=48000;N=SR*15
config=json.loads((A/'voiceover.json').read_text())

def ff(args):
    return subprocess.run(['ffmpeg','-hide_banner','-y',*map(str,args)],check=True,capture_output=True)

def decode(file,filters=None):
    args=['-v','error','-i',file]
    if filters:args+=['-af',filters]
    return np.frombuffer(ff(args+['-ar',SR,'-ac',2,'-f','f32le','pipe:1']).stdout,dtype='<f4').reshape(-1,2).astype(np.float64)

def write(path,x):
    if not np.isfinite(x).all() or np.max(np.abs(x))>=1:raise ValueError('Invalid or clipped stem '+str(path))
    with wave.open(str(path),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).round().astype('<i2').tobytes())

voice=np.zeros((N,2));placements=[]
for c in config['cues']:
    raw=A/'takes'/f"{c['id']}.mp3"
    x=decode(raw)
    # Keep 80 ms of handle around detected speech; never truncate to a cue slot.
    active=np.flatnonzero(np.max(np.abs(x),axis=1)>.005)
    if not len(active):raise ValueError('Empty narration '+c['id'])
    first=max(0,int(active[0])-.08*SR)/SR
    last=min(len(x),int(active[-1])+.08*SR)/SR
    slot=c['end']-c['start'];duration=last-first
    rate=max(.94,duration/slot)
    if rate>1.28:raise ValueError(f"Rewrite or regenerate {c['id']}: required speed {rate:.2f}")
    filters=f'atrim=start={first}:end={last},asetpts=PTS-STARTPTS,atempo={rate},highpass=f=65,afade=t=in:d=0.008'
    x=decode(raw,filters)
    if len(x)>round(slot*SR)+2400:raise ValueError('Tempo exceeded slot')
    # atempo rounding may leave a few ms: place actual speech, verify no cue overlap.
    peak=np.max(np.abs(x));x*=.58/peak
    ramp=min(384,len(x));x[-ramp:]*=np.linspace(1,0,ramp)[:,None]
    pos=round(c['start']*SR)
    if pos+len(x)>N:raise ValueError('Narration runs beyond video')
    voice[pos:pos+len(x)]+=x
    placements.append({**c,'sourceTrimStart':first,'sourceTrimEnd':last,'tempo':rate,'actualEnd':(pos+len(x))/SR})
for a,b in zip(placements,placements[1:]):
    if a['actualEnd']>b['start']:raise ValueError('Overlapping voice cues')
write(A/'voiceover.wav',voice)
music=decode(A/'music.wav');sfx=decode(A/'sfx.wav')
assert music.shape==sfx.shape==voice.shape
# Voice-following spectral carve and broadband ducking, 10 ms detector with
# 30 ms attack / 320 ms release. No static hole in the music during pauses.
block=480
rms=np.sqrt(np.mean(voice.reshape(-1,block,2)**2,axis=(1,2)))
envelope=[];level=0
for value in rms:
    target=min(1,value/.065)
    coefficient=np.exp(-.01/(.03 if target>level else .32))
    level=coefficient*level+(1-coefficient)*target;envelope.append(level)
envelope=np.interp(np.arange(N),np.arange(len(envelope))*block,envelope)
# Smooth FFT split: voice body and presence receive up to 6 dB attenuation.
freq=np.fft.rfftfreq(N,1/SR)
band=(1-np.exp(-(freq/250)**4))*np.exp(-(freq/3500)**4)
body=np.fft.irfft(np.fft.rfft(music,axis=0)*band[:,None],n=N,axis=0)
carved=(music-body*(.5*envelope[:,None]))*(10**(-5*envelope[:,None]/20))
write(A/'music-carved.wav',carved)
write(A/'premaster.wav',voice+carved+sfx*.65)
# Two-pass EBU R128, conservative true-peak ceiling survives AAC encoding.
measure=ff(['-i',A/'premaster.wav','-af','loudnorm=I=-16:TP=-1.8:LRA=7:print_format=json','-f','null','-'])
m=json.loads(re.findall(r'\{[^{}]+\}',measure.stderr.decode())[-1])
normalizer=f"loudnorm=I=-16:TP=-1.8:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
ff(['-v','error','-i',A/'premaster.wav','-af',normalizer,'-ar',SR,'-c:a','pcm_s24le',A/'master.wav'])
output=ROOT/'output/release-complete.mp4'
if '--audio-only' not in sys.argv: ff(['-v','error','-i',ROOT/'output/release-silent.mp4','-i',A/'master.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-ar',SR,'-t','15','-metadata','title='+config['title']+' | elevenlabs.io','-metadata','comment=AI narration by ElevenLabs; original procedural music and sound design. See RIGHTS.md for generation-time license provenance.','-movflags','+faststart',output])
(A/'mix-receipt.json').write_text(json.dumps({'voice':placements,'sampleRate':SR,'duration':15,'carve':{'detectorMs':10,'attackMs':30,'releaseMs':320,'spectralReductionDb':6,'duckDb':5},'premasterLoudness':m,'targetLUFS':-16,'truePeakCeilingDBTP':-1.8,'video':'stream copy of silent master','output':str(output.relative_to(ROOT))},indent=2)+'\n')
print('Mastered audio/master.wav' if '--audio-only' in sys.argv else 'Mixed and muxed '+str(output.relative_to(ROOT)))
