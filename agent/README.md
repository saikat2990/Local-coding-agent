# Local Code Agent

A self-built coding agent: takes a codebase + a natural-language instruction
and produces a code change, using a local LLM (Devstral, via Ollama) instead
of a hosted API.

## Pipeline

1. repo_map.py    - walk the target repo, extract file tree + symbol signatures (tree-sitter)
2. retrieval.py   - pick files relevant to the instruction (keyword overlap, for now)
3. prompting.py   - build the prompt (repo map + selected files + recent history + instruction)
                    and track SessionHistory across turns in one run
4. llm_client.py  - call the local model via Ollama's OpenAI-compatible API
5. edit_parser.py - parse SEARCH/REPLACE edit blocks out of the model's response
6. validator.py   - confirm each SEARCH block matches the file's current content
7. applier.py     - apply validated edits to disk
8. verifier.py    - optionally run a test command and report pass/fail
9. vcs.py         - git commit the change on success
10. orchestrator.py - ties 1-9 together with a bounded retry loop that feeds
                       errors (bad edit format, failed tests) back to the model

## Usage

    cd agent
    pip install -r requirements.txt
    python cli.py

It will ask for the path to the codebase to operate on (e.g. ../sample-target-codebase)
and an optional test command, then loop accepting instructions until you type 'exit'.

## Target codebase

../sample-target-codebase is a small throwaway repo to test against safely
before pointing this at a real project. It has its own git history so every
agent edit is a reviewable, revertible commit.
