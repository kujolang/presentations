from pathlib import Path
import json
p=Path(__file__).resolve().parents[1];(p/'compositions').mkdir(exist_ok=True)
deck=json.loads((p.parents[1]/'decks/kujo-investor/deck.json').read_text())
scenes=[]
for i,s in enumerate(deck['slides'],1):
 ident=f'slide-{i:02}'
 (p/f'compositions/{ident}.html').write_text(f'''<template>
<style>#root{{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:#080808}}img{{width:1920px;height:1080px;object-fit:contain}}</style>
<div id="root" data-composition-id="{ident}" data-duration="8" data-width="1920" data-height="1080" data-hold="Deliberate eight-second reading hold of original investor slide">
<img id="{ident}-image" src="assets/slides/{i:02}.png" alt="Kujo investor slide {i}" />
</div>
<script>window.__timelines=window.__timelines||{{}};window.__timelines["{ident}"]=gsap.timeline({{paused:true}}).to({{}},{{duration:8}},0);</script>
</template>''')
 scenes.append(f'<div id="{ident}" class="clip scene" data-composition-id="{ident}" data-composition-src="compositions/{ident}.html" data-start="{(i-1)*8}" data-duration="8" data-track-index="0" data-track-kind="graphics"></div>')
(p/'index.html').write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><style>*{margin:0;padding:0;box-sizing:border-box}html,body,#root{width:1920px;height:1080px;overflow:hidden;background:#080808}#root{position:relative}.scene{position:absolute;inset:0}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="144" data-width="1920" data-height="1080">'''+ '\n'.join(scenes)+'''</div><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true}).to({},{duration:144},0);</script></body></html>''')
(p/'SPEC.md').write_text('''# Original-deck social slideshow
1920×1080, 30fps, 144 seconds. All 18 primary slides in original order. Each slide holds for 240 frames (8 seconds); frame 0 is the complete opening slide; frame 4319 is the complete closing slide. Clean cuts retain readable type with no blended text. Browser chrome and navigation are excluded; original slide content, citations, financial qualifications and typography are preserved. No reframing, new claims, voiceover or soundtrack. Silent by design for a source-faithful slide-through that users can pause or soundtrack in a social app. Banned: zooming/cropping text, flashy transitions, animated decorative overlays, invented narration. Other film concepts are outside this request: no shortened teaser or vertical rewrite.
''')
(p/'STORYBOARD.md').write_text('# Timeline\n\n'+'\n'.join(f'- {8*i:03}–{8*(i+1):03}s: {s["title"]}' for i,s in enumerate(deck['slides'])))
