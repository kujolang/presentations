import fs from 'node:fs';
import path from 'node:path';
import {root,hf} from './common.mjs';
fs.mkdirSync(path.join(root,'output'),{recursive:true});
const out=hf(['check','.','--at','0,0.5,1.8,2.3,3.2,4.2,5.1,6.1,6.6,7.1,7.6,8.1,9.1,9.7,10.5,11.2,12.6,14.958333','--json'],{encoding:'utf8',stdio:['ignore','pipe','inherit']});
const portable=out.split(root).join('./');fs.writeFileSync(path.join(root,'output/check.json'),portable);console.log(portable);
