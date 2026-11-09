from pathlib import Path
import subprocess,json,hashlib
from PIL import Image,ImageChops,ImageStat
p=Path(__file__).resolve().parents[1];v=p/'renders/kujo-investor-1080p.mp4';out=p/'qa/decoded';out.mkdir(exist_ok=True)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(v)]));(p/'qa/ffprobe.json').write_text(json.dumps(probe,indent=2))
s=next(x for x in probe['streams'] if x['codec_type']=='video');assert (s['width'],s['height'])==(1920,1080);assert s['codec_name']=='h264';assert s['pix_fmt']=='yuv420p';assert s['r_frame_rate']=='30/1';assert abs(float(probe['format']['duration'])-144)<.05;assert int(s['nb_frames'])==4320
results=[]
for i in range(18):
 f=out/f'{i+1:02}.png';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(i*8+4),'-i',str(v),'-frames:v','1',str(f)],check=True)
 a=Image.open(f).convert('RGB');b=Image.open(p/f'assets/slides/{i+1:02}.png').convert('RGB');assert a.size==b.size
 mae=sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3;results.append({'slide':i+1,'timestamp':i*8+4,'meanAbsolutePixelError':round(mae,4)});assert mae<3,(i,mae)
# Verify first/last displayed frames; never deliver a black lead-in or tail.
for label,t,slide in [('first',0,1),('last',143.966667,18)]:
 f=out/f'{label}.png';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(v),'-frames:v','1',str(f)],check=True)
 mae=sum(ImageStat.Stat(ImageChops.difference(Image.open(f).convert('RGB'),Image.open(p/f'assets/slides/{slide:02}.png').convert('RGB'))).mean)/3;assert mae<3,(label,mae)
# Check moov precedes mdat for progressive-download playback.
data=v.read_bytes();assert data.find(b'moov')<data.find(b'mdat')
report={'pass':True,'durationSeconds':144,'frames':4320,'fps':30,'width':1920,'height':1080,'codec':'h264','pixelFormat':'yuv420p','audioStreams':sum(x['codec_type']=='audio' for x in probe['streams']),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'faststart':True,'slides':results,'firstAndLastFramesMatch':True};(p/'qa/verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
