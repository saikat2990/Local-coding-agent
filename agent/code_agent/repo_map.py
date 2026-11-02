import os
from pathlib import Path
from tree_sitter_languages import get_parser
import pathspec

LANG_BY_EXT = {".py": "python", ".ts": "typescript", ".tsx": "tsx", ".js": "javascript"}


def load_gitignore(repo_path):
    gi = Path(repo_path) / ".gitignore"
    lines = gi.read_text().splitlines() if gi.exists() else []
    return pathspec.PathSpec.from_lines("gitwildmatch", lines)


def walk_repo(repo_path):
    spec = load_gitignore(repo_path)
    files = []
    for root, dirs, fnames in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__", ".venv", "venv", "env", ".env", "dist", "build", ".pytest_cache", ".mypy_cache")]
        for f in fnames:
            full = Path(root) / f
            rel = full.relative_to(repo_path)
            if spec.match_file(str(rel)):
                continue
            if full.suffix in LANG_BY_EXT:
                files.append(rel)
    return files


def extract_symbols(file_path, lang):
    parser = get_parser(lang)
    code = file_path.read_bytes()
    tree = parser.parse(code)
    wanted = {
        "function_definition", "class_definition",
        "function_declaration", "class_declaration", "method_definition",
    }
    symbols = []

    def visit(node):
        if node.type in wanted:
            name_node = next((c for c in node.children if c.type == "identifier"), None)
            name = code[name_node.start_byte:name_node.end_byte].decode() if name_node else "?"
            symbols.append(name)
        for child in node.children:
            visit(child)

    visit(tree.root_node)
    return symbols


def build_repo_map(repo_path):
    repo_path = Path(repo_path)
    repo_map = {}
    for rel_file in walk_repo(repo_path):
        lang = LANG_BY_EXT[rel_file.suffix]
        try:
            repo_map[str(rel_file)] = extract_symbols(repo_path / rel_file, lang)
        except Exception as e:
            repo_map[str(rel_file)] = [f"(parse error: {e})"]
    return repo_map


def repo_map_to_text(repo_map):
    return "\n".join(f"{f}: {', '.join(syms) or '(no symbols)'}" for f, syms in repo_map.items())
