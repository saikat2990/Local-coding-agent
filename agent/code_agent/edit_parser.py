import re

EDIT_RE = re.compile(
    r"<<<<<<< SEARCH: (?P<file>.+?)\n(?P<search>.*?)\n?=======\n(?P<replace>.*?)\n>>>>>>> REPLACE",
    re.DOTALL,
)


def parse_edit_blocks(response_text):
    return [
        {"file": m.group("file").strip(), "search": m.group("search"), "replace": m.group("replace")}
        for m in EDIT_RE.finditer(response_text)
    ]
