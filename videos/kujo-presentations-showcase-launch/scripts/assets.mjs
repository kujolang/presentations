import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {root} from './common.mjs';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets-manifest.json')));
for(const a of manifest.assets){const bytes=fs.readFileSync(path.join(root,a.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256,`Asset changed: ${a.path}`);}
console.log(`Assets OK: ${manifest.assets.length} SHA-256 hashes; local licensed font and official Kujo mark.`);
