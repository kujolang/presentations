import assert from 'node:assert/strict';
import { ownership } from './ownership.mjs';
assert.equal(ownership(6,30),20);
assert.equal(ownership(3,30),10);
console.log('PASS: post-money ownership examples 6/30 and 3/30');
