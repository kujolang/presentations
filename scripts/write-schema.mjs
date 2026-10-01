import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const text=maxLength=>({type:'string',minLength:1,maxLength});
const array=items=>({type:'array',items});
const object=(properties,required=Object.keys(properties))=>({type:'object',properties,required,additionalProperties:false});
const transitions=object({enabled:{type:'boolean'},effect:{enum:['fade','slide','zoom','editorial','focus','kinetic']},duration:{type:'number',minimum:0.1,maximum:2},easing:{enum:['linear','easeIn','easeOut','easeInOut']},intensity:{type:'number',minimum:0.25,maximum:2},stagger:{type:'number',minimum:0,maximum:0.2}},[]);
const fields={transitions,
  layout:text(60),title:text(110),copy:text(600),eyebrow:text(600),note:text(600),inverse:{type:'boolean'},
  images:array(object({src:{...text(180),pattern:'^(?!/)(?!.*\\.\\.)[a-zA-Z0-9_/-]+\\.[a-zA-Z0-9]+$'},alt:text(300),x:{type:'number',minimum:0,maximum:100},y:{type:'number',minimum:0,maximum:100}},['src','alt'])),
  features:array(object({title:text(70),copy:text(300)})),metrics:array(object({value:text(16),label:text(100)})),
  chart:array(object({label:text(40),value:{type:'number',minimum:0,maximum:100}})),chartLabel:text(180)
};
const variants=readdirSync('layouts').filter(n=>n.endsWith('.json')).sort().map(file=>{
  const name=file.slice(0,-5),contract=JSON.parse(readFileSync(`layouts/${file}`));
  const properties={layout:{const:name},title:text(contract.titleMax),copy:text(contract.copyMax)};
  for(const [key,maxItems] of Object.entries(contract.limits)) properties[key]={maxItems};
  properties.features.items={properties:{copy:text(contract.featureCopyMax)}};
  if(name==='market') properties.chart.minItems=1;
  return {properties,...(name==='market'?{required:['chart']}:{})};
});
const schema={$schema:'https://json-schema.org/draft/2020-12/schema',title:'Kujo Presentations deck',...object({id:{...text(60),pattern:'^[a-z0-9][a-z0-9-]*$'},title:text(160),brand:text(50),description:text(400),lang:{...text(63),pattern:'^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{1,8})*$'},footer:text(100),transitions,slides:{...array({...object(fields,['layout','title']),oneOf:variants}),minItems:1}},['id','title','brand','description','slides'])};
writeFileSync('deck.schema.json',JSON.stringify(schema,null,2)+'\n');
