"""Verify the source-fix preparer against small ZIP fixtures, not a browser copy."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import sys

root = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('prepare_firefox', root / 'scripts/prepare-firefox.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
manifest = json.loads((root / 'patches/firefox-channel-identity/manifest.json').read_text())
upstream = Path(sys.argv.pop(1))


class PreparationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)
        self.source = self.base / 'installed'
        self.source.mkdir()
        (self.source / 'firefox').write_bytes(b'original executable')
        (self.source / 'firefox').chmod(0o755)
        self.destination = self.base / 'prepared'
        self.destination.mkdir()
        self.original = (upstream / 'main.js').read_bytes()
        self.channel = (upstream / 'SimpleChannel.js').read_bytes()

    def archive(self, initializer):
        with zipfile.ZipFile(self.source / 'omni.ja', 'w') as archive:
            archive.writestr(manifest['member'], initializer)
            archive.writestr(manifest['channelMember'], self.channel)
            archive.writestr('unrelated/resource.bin', b'\x00\x01untouched')

    def test_changes_only_reviewed_source_and_preserves_installed_browser(self):
        self.archive(self.original)
        installed_bytes = (self.source / 'omni.ja').read_bytes()
        module.prepare(self.source, Path('firefox'), Path('omni.ja'), self.destination, manifest)
        self.assertEqual((self.source / 'omni.ja').read_bytes(), installed_bytes)
        with zipfile.ZipFile(self.source / 'omni.ja') as before, zipfile.ZipFile(self.destination / 'browser/omni.ja') as after:
            self.assertEqual(before.namelist(), after.namelist())
            for member in before.namelist():
                if member == manifest['member']:
                    self.assertEqual(module.digest(after.read(member)), manifest['patchedSHA256'])
                else:
                    self.assertEqual(before.read(member), after.read(member))
        self.assertEqual((self.destination / 'browser/firefox').read_bytes(), b'original executable')
        self.assertEqual((self.destination / 'browser/firefox').stat().st_mode & 0o777, 0o755)
        self.assertEqual((self.destination / 'upstream/main.js').read_bytes(), self.original)

    def test_unknown_source_fails_before_copying_or_changing_any_browser(self):
        self.archive(self.original + b'\n// changed upstream')
        before = (self.source / 'omni.ja').read_bytes()
        with self.assertRaisesRegex(ValueError, 'initializer changed'):
            module.prepare(self.source, Path('firefox'), Path('omni.ja'), self.destination, manifest)
        self.assertEqual((self.source / 'omni.ja').read_bytes(), before)
        self.assertEqual(list(self.destination.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
