import re


def select_relevant_files(instruction, repo_map, top_k=5):
    words = set(re.findall(r"\w+", instruction.lower()))
    scored = []
    for file, symbols in repo_map.items():
        tokens = set(re.findall(r"\w+", file.lower())) | {s.lower() for s in symbols}
        score = len(words & tokens)
        if score > 0:
            scored.append((score, file))
    scored.sort(reverse=True)
    top = [f for _, f in scored[:top_k]]
    return top or list(repo_map.keys())[:top_k]
