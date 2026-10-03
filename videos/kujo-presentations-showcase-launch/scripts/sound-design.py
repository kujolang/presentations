"""Original deterministic 96 BPM electronic score and frame-timed interface Foley.
Requires Python 3 + NumPy; writes 48 kHz stereo PCM stems, no network calls.
"""
import json, math, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
SR = 48000
N = SR * 15
config=json.loads((ROOT/'audio/voiceover.json').read_text())
seed=config.get('music_seed',20260906)
rng = np.random.default_rng(seed)
music = np.zeros((N, 2), dtype=np.float64)
sfx = np.zeros_like(music)
cues = []

def write(name, x):
    assert np.isfinite(x).all() and np.max(np.abs(x)) < 1
    with wave.open(str(ROOT / 'audio' / name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).round().astype('<i2').tobytes())

def put(bus, start, x, pan=0):
    if x.ndim == 1:
        x = x[:, None] * np.array([math.sqrt((1-pan)/2), math.sqrt((1+pan)/2)])
    i = round(start * SR); size = min(len(x), N-i)
    if size > 0: bus[i:i+size] += x[:size]

def tone(freq, dur, attack=.015, decay=.35):
    t = np.arange(round(dur*SR))/SR
    env = (1-np.exp(-t/attack))*np.exp(-t/decay)*np.minimum((dur-t)/.025,1)
    return t, env

# Slowly breathing D-minor/add9 bed: sine/triangle partials, wide but mono-safe.
t=np.arange(N)/SR
fade=np.minimum(t/.7,1)*np.minimum((15-t)/.65,1)
for j,f in enumerate([73.4162,146.8324,220,261.6256,329.6276]):
    amp=[.025,.014,.010,.005,.004][j]
    for c in range(2):
        drift=.12*np.sin(2*np.pi*(.07+.01*j)*t+c*.5)
        music[:,c] += amp*np.sin(2*np.pi*f*t+drift)*(.82+.18*np.sin(2*np.pi*.13*t+j)) * fade
# A quiet machine pulse: 24 beats at 96 BPM. No heavy kick or cymbal loop.
notes=[293.6648,440,587.3295,659.2551,440,349.2282,293.6648,440]
for beat in range(24):
    start=beat*.625
    tt,en=tone(notes[beat%8],.6,decay=.17)
    put(music,start,.018*en*(np.sin(2*np.pi*notes[beat%8]*tt)+.14*np.sin(4*np.pi*notes[beat%8]*tt)),(-.3,.3)[beat%2])
    if beat%2==0:
        tt,en=tone(73.4162,.48,attack=.012,decay=.12)
        put(music,start,.032*en*np.sin(2*np.pi*73.4162*tt))
music*=fade[:,None]

def ping(at,freq=1100,level=.06,dur=.17,label='interface tick',pan=0):
    tt,en=tone(freq,dur,attack=.0015,decay=dur/5)
    put(sfx,at,level*en*(np.sin(2*np.pi*freq*tt)+.12*np.sin(2*np.pi*freq*1.5*tt)),pan)
    cues.append({'start':at,'duration':dur,'event':label})

def sweep(at,dur=.24,level=.025,label='transition air'):
    tt=np.arange(round(dur*SR))/SR
    noise=rng.normal(0,1,len(tt)); noise=np.convolve(noise,np.ones(15)/15,mode='same')
    env=np.sin(np.pi*tt/dur)**2
    put(sfx,at,level*noise*env,-.12)
    cues.append({'start':at,'duration':dur,'event':label})

ping(.09,73.4162,.12,.65,'brand low pulse')
sweep(1.40,.30,.045,'speed cut')
sweep(2.68,.26,.045,'task surface')
for j,at in enumerate(np.linspace(3.394,4.186,len(config['task']))):
    ping(float(at),1450+(j%4)*95,.019,.036,'typed character',(-.15,.15)[j%2])
ping(5.08,880,.065,.10,'cursor click')
sweep(5.53,.25,.035,'loop reveal')
for j,at in enumerate([6.05,6.48,6.91,7.34,7.77]):
    ping(at,[440,523.251,587.33,659.255,880][j],.044,.19,'loop checkpoint',-.15+j*.075)
sweep(8.48,.24,.04,'proof reveal')
for j,at in enumerate([9.02,9.52,10.02]):
    ping(at,[587.33,659.255,880][j],.05,.32,'evidence confirmation')
ping(10.62,1174.659,.03,.25,'loop complete')
sweep(11.89,.33,.05,'closing contraction')
for f in [146.8324,220,293.6648,440]:
    ping(12.16,f,.036,1.8,'brand resolution')
sfx*=np.minimum((15-t)/.15,1)[:,None]
write('music.wav',music);write('sfx.wav',sfx)
(ROOT/'audio/sound-cues.json').write_text(json.dumps({'bpm':96,'sampleRate':SR,'duration':15,'seed':seed,'cues':cues},indent=2)+'\n')
print('Created original music.wav and sfx.wav: 15 s / 48 kHz stereo.')
