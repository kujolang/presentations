"""Apply the pinned Juggler source correction to a project-owned browser copy.

The caller supplies a private temporary directory. Never writes to Playwright's
installed browser. Python's standard ZIP reader preserves each entry's metadata.
"""
import hashlib
import json
from pathlib import Path
import shutil
import sys
import zipfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def prepare(source_root, executable, archive, destination, manifest):
    with zipfile.ZipFile(source_root / archive) as source:
        original = source.read(manifest['member'])
        channel = source.read(manifest['channelMember'])
    if digest(original) != manifest['originalSHA256']:
        raise ValueError('Firefox initializer changed; review the source fix before updating its pin')
    if digest(channel) != manifest['channelSHA256']:
        raise ValueError('Firefox transport changed; review the regression before updating its pin')
    before, after = manifest['before'].encode(), manifest['after'].encode()
    if original.count(before) != 1:
        raise ValueError('Expected exactly one channel identity expression')
    patched = original.replace(before, after)
    if digest(patched) != manifest['patchedSHA256']:
        raise ValueError('Patched Firefox initializer hash does not match the reviewed source')

    browser = destination / 'browser'
    shutil.copytree(source_root, browser, symlinks=True)
    copied_archive = browser / archive
    temporary_archive = copied_archive.with_suffix('.patched.tmp')
    with zipfile.ZipFile(copied_archive) as source, zipfile.ZipFile(temporary_archive, 'w') as target:
        target.comment = source.comment
        for entry in source.infolist():
            data = patched if entry.filename == manifest['member'] else source.read(entry.filename)
            target.writestr(entry, data)
    temporary_archive.replace(copied_archive)
    # Keep the exact upstream source for deterministic transport tests, including
    # its MPL-2.0 notices; this is an ignored build artifact, not vendored runtime.
    upstream = destination / 'upstream'
    upstream.mkdir()
    (upstream / 'main.js').write_bytes(original)
    (upstream / 'SimpleChannel.js').write_bytes(channel)
    receipt = {
        'executable': str(Path('browser') / executable),
        'archive': str(Path('browser') / archive),
        'archiveSHA256': digest(copied_archive.read_bytes()),
        'originalSHA256': digest(original),
        'patchedSHA256': digest(patched),
        'channelSHA256': digest(channel),
    }
    (destination / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')


if __name__ == '__main__':
    source_root, executable, archive, destination, manifest_path = map(Path, sys.argv[1:])
    prepare(source_root, executable, archive, destination, json.loads(manifest_path.read_text()))
