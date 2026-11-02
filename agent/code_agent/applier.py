from pathlib import Path


def apply_edits(edits, repo_path):
    diffs = []
    for e in edits:
        path = Path(repo_path) / e["file"]
        if e["search"].strip() == "":
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(e["replace"])
        else:
            text = path.read_text(errors="ignore")
            path.write_text(text.replace(e["search"], e["replace"], 1))
        diffs.append(f"{e['file']}:\n- {e['search'][:120]!r}\n+ {e['replace'][:120]!r}")
    return "\n".join(diffs)
