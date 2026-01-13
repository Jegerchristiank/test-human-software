from __future__ import annotations

import sys
from pathlib import Path
import unittest

# Ensure the scripts directory is on sys.path so we can import the conversion modules.
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import convert_kortsvar  # noqa: E402
import convert_rawdata  # noqa: E402


class ConvertHeaderParsingTest(unittest.TestCase):
    def assert_session(self, regex, text, expected_session):
        match = regex.match(text)
        self.assertIsNotNone(match, msg=f"Regex failed to match header: {text!r}")
        session = match.groupdict().get("session")
        if session is None:
            # For convert_rawdata we rely on positional groups.
            session = match.group(2)
        session = session.strip() if session else None
        self.assertEqual(session, expected_session)

    def test_rawdata_year_header_with_space_session(self):
        self.assert_session(convert_rawdata.YEAR_HEADER_RE, "2026 Ordinær", "Ordinær")

    def test_rawdata_year_header_with_dash_session(self):
        self.assert_session(convert_rawdata.YEAR_HEADER_RE, "2026 - Sygeeksamen", "Sygeeksamen")

    def test_rawdata_year_header_without_session(self):
        self.assert_session(convert_rawdata.YEAR_HEADER_RE, "2026", None)
        self.assert_session(convert_rawdata.YEAR_HEADER_RE, "2026   ", None)

    def test_kortsvar_year_header_with_space_session(self):
        self.assert_session(convert_kortsvar.YEAR_RE, "2026 Ordinær", "Ordinær")

    def test_kortsvar_year_header_with_dash_session(self):
        self.assert_session(convert_kortsvar.YEAR_RE, "2026 - Sygeeksamen", "Sygeeksamen")

    def test_kortsvar_year_header_without_session(self):
        self.assert_session(convert_kortsvar.YEAR_RE, "2026", None)


if __name__ == "__main__":
    unittest.main()
