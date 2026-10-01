// Exercise the actual pinned Juggler sources, not a reimplementation of its
// duplicate-suppression algorithm. The initializer's Firefox-only dependencies
// are inert substitutes; channel delivery and identity construction are real.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {firefoxFix, firefoxFixDirectory} from '../scripts/prepare-firefox.mjs';

const channelSource = readFileSync(join(firefoxFixDirectory, 'upstream/SimpleChannel.js'), 'utf8');
const initializerSource = readFileSync(join(firefoxFixDirectory, 'upstream/main.js'), 'utf8');

function harness(patched = true) {
  let serial = 0;
  const sandbox = vm.createContext({
    dump() {},
    Services: {appinfo: {processID: 42}, scriptloader: {loadSubScript() {}}, cpmm: {sharedData: {get() {}}}},
    ChromeUtils: {importESModule(url) {
      if (url.endsWith('/Helper.js')) return {Helper: class {generateId() {return `unique-${++serial}`;}}};
      if (url.endsWith('/FrameTree.js')) return {FrameTree: class {setInitScripts() {}}};
      if (url.endsWith('/PageAgent.js')) return {PageAgent: class {}};
      throw new Error(`Unexpected Firefox dependency: ${url}`);
    }}
  });
  vm.runInContext(channelSource + '\nglobalThis.Channel = SimpleChannel;', sandbox);
  const initializer = patched ? initializerSource.replace(firefoxFix.before, firefoxFix.after) : initializerSource;
  vm.runInContext(initializer.replace('export function initialize', 'function initialize') + '\nglobalThis.initialize = initialize;', sandbox);
  const parent = new sandbox.Channel('parent', 'target-1');
  const child = () => sandbox.initialize({originAttributes: {userContextId: 1}, browserId: 1}, {}).channel;
  const transport = {dropACK: false, dropResponse: false};
  function link(peer) {
    parent.resetTransport(); peer.resetTransport();
    peer.transport = {dispose() {}, sendMessage(message) {
      if (!(transport.dropACK && message.ack === 'RESPONSE_ACK')) parent._onMessage(message);
    }};
    parent.setTransport({dispose() {}, sendMessage(message) {
      if (!(transport.dropResponse && message.responseId)) peer._onMessage(message);
    }});
  }
  return {parent, child, link, transport};
}

const tick = () => new Promise(resolve => setImmediate(resolve));

test('Firefox channel identity prevents a new commit being mistaken for an old start event', async () => {
  for (const patched of [false, true]) {
    const {parent, child, link, transport} = harness(patched);
    const delivered = [];
    parent.register('page', {
      pageNavigationStarted: () => delivered.push('start'),
      pageNavigationCommitted: () => delivered.push('commit')
    });
    const old = child(); link(old); transport.dropACK = true;
    await old.connect('page').send('pageNavigationStarted');
    assert.equal(parent._bufferedResponses.size, 1);
    const next = child(); link(next); transport.dropACK = false;
    await next.connect('page').send('pageNavigationCommitted');
    // The unmodified source is the negative control: it silently drops commit.
    assert.deepEqual(delivered, patched ? ['start', 'commit'] : ['start']);
    assert.equal(old._uid === next._uid, !patched);
  }
});

test('Firefox keeps duplicate suppression when the same channel rebinds to a new actor', async () => {
  const {parent, child, link, transport} = harness();
  let delivered = 0;
  parent.register('page', {event: () => ++delivered});
  const peer = child(); link(peer); transport.dropResponse = true;
  const reply = peer.connect('page').send('event');
  await tick();
  assert.equal(delivered, 1);
  transport.dropResponse = false; link(peer);
  assert.equal(await reply, 1);
  assert.equal(delivered, 1);
});

test('Firefox does not deliver an old asynchronous response to a replacement channel', async () => {
  const {parent, child, link} = harness();
  let finishOld;
  const gate = new Promise(resolve => {finishOld = resolve;});
  parent.register('page', {event: async value => value === 'old' ? await gate : value});
  const old = child(); link(old);
  old.connect('page').emit('event', 'old');
  await tick();
  const next = child(); link(next);
  assert.equal(await next.connect('page').send('event', 'new'), 'new');
  finishOld('stale'); await tick();
  assert.equal(parent._bufferedResponses.size, 0);
  assert.equal(await next.connect('page').send('event', 'another'), 'another');
  old.dispose(); next.dispose(); parent.dispose();
});

test('Firefox preparation fails closed and changes only the reviewed source in a private copy', async () => {
  const {spawnSync} = await import('node:child_process');
  const result = spawnSync('python3', ['-B', 'tests/firefox-preparation.py', join(firefoxFixDirectory, 'upstream')], {encoding:'utf8'});
  assert.equal(result.status, 0, result.error?.message || result.stderr);
});
