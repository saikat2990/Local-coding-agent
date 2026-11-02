import sys
from .repo_map import build_repo_map, repo_map_to_text
from .retrieval import select_relevant_files
from .prompting import build_prompt, SessionHistory
from .llm_client import call_llm
from .edit_parser import parse_edit_blocks
from .validator import validate_edits
from .applier import apply_edits
from .verifier import run_tests
from .vcs import git_commit


def _log(msg):
    print(msg, flush=True)


def generate_code(client, model, instruction, repo_path, history: SessionHistory,
                   test_cmd=None, max_retries=3):
    _log("  [1/6] Building repo map (walking files, extracting symbols)...")
    repo_map = build_repo_map(repo_path)
    repo_map_text = repo_map_to_text(repo_map)
    _log(f"        -> {len(repo_map)} source files indexed")

    _log("  [2/6] Selecting relevant files for this instruction...")
    selected = select_relevant_files(instruction, repo_map)
    _log(f"        -> selected: {selected if selected else '(none matched, using fallback)'}")

    _log("  [3/6] Building prompt (repo map + files + history)...")
    prompt = build_prompt(repo_map_text, selected, repo_path, instruction, history)

    error_context = None
    for attempt in range(1, max_retries + 1):
        _log(f"  [4/6] Calling model '{model}' via Ollama (attempt {attempt}/{max_retries})"
             f" -- this can take a while on CPU, please wait...")
        response = call_llm(client, model, prompt, error_context)
        _log("        -> response received, parsing edit blocks...")
        edits = parse_edit_blocks(response)

        if not edits:
            preview = response[:800].replace("\n", "\n        | ")
            _log("        -> no valid edit blocks found. Raw model response (first 800 chars):")
            _log(f"        | {preview}")
            if "<<<<<<< SEARCH:" in response and "<<<<<<< SEARCH: \n" in response.replace("\r\n", "\n") or "<<<<<<< SEARCH:\n" in response.replace("\r\n", "\n"):
                error_context = (
                    "You used the SEARCH/REPLACE markers, but the SEARCH line had no "
                    "file path on it. It must be exactly '<<<<<<< SEARCH: path/to/file.ext' "
                    "with the real relative file path right after the colon, never "
                    "'<<<<<<< SEARCH:' alone on its own line."
                )
            else:
                error_context = "No valid edit blocks found in response."
            continue

        _log(f"  [5/6] Validating {len(edits)} edit block(s)...")
        errors = validate_edits(edits, repo_path)
        if errors:
            _log(f"        -> validation failed: {errors}")
            error_context = "\n".join(errors)
            continue

        _log("        -> all edits valid, applying to disk...")
        diff_summary = apply_edits(edits, repo_path)

        _log("  [6/6] Running verification (tests, if configured)...")
        passed, output = run_tests(repo_path, test_cmd)

        if passed:
            _log("        -> passed, committing to git...")
            git_commit(repo_path, instruction)
            history.add(instruction, diff_summary)
            return {"status": "success", "diff": diff_summary, "test_output": output}
        else:
            _log(f"        -> tests failed, retrying with error feedback:\n{output}")
            error_context = f"Tests failed:\n{output}"

    return {"status": "failed", "reason": error_context}
