from pathlib import Path


def validate_edits(edits, repo_path):
    errors = []
    for e in edits:
        path = Path(repo_path) / e["file"]
        if e["search"].strip() == "":
            continue
        if not path.exists():
            errors.append(f"{e['file']}: file does not exist")
            continue
        if e["search"] not in path.read_text(errors="ignore"):
            errors.append(f"{e['file']}: SEARCH text not found")
    return errors
