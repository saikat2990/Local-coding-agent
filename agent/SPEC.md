# Local Code Agent — Project Specification

## Overview

A self-built, local-only coding agent: given an existing codebase and a
natural-language instruction, it produces a validated, tested, committed
code change. It runs entirely on local hardware (CPU, no GPU) via Ollama,
with no code or data leaving the machine.

## Problem / Motivation

Tools like Aider, Cursor, and Cline already do this well -- the goal here
was not to replace them, but to understand how an agentic coding loop
actually works by building the core mechanics from scratch: context
retrieval from a codebase, prompt construction, parsing a model's output
into a safe, structured edit, validating it before touching disk, and
recovering from a bad attempt without human intervention.

## Goals

- Take a codebase path and a plain-English instruction as input.
- Ground the model in the actual codebase (not just the instruction alone).
- Apply the resulting change safely, with validation before any write.
- Recover automatically from a malformed or failing attempt, within a
  bounded number of retries.
- Keep every successful change as its own reviewable, revertible git commit.
- Support a running session where later instructions can reference earlier
  changes (e.g. "now add a test for that").
- Be model-agnostic: swapping the underlying local LLM is a one-line config
  change, not a code change.

## Non-Goals (for this version)

- Full autonomy: the model does not decide what to retrieve or when to run
  tests -- the orchestration code does. This is a *scaffolded* agent, not
  one where the model calls tools itself.
- Executing/installing generated code (e.g. running `npm install`) -- the
  pipeline validates edit *format* and optional test commands, not that a
  newly scaffolded project actually builds and runs.
- Semantic (embeddings-based) file retrieval -- file selection is currently
  keyword-overlap based.

## Architecture

Instruction + codebase path
  -> repo_map.py     : walk the repo, extract file tree + symbol signatures (tree-sitter)
  -> retrieval.py     : select relevant files via keyword overlap with the instruction
  -> prompting.py     : build the prompt (repo map + selected files + session history + instruction)
  -> llm_client.py    : call the local model via Ollama's OpenAI-compatible API
  -> edit_parser.py   : parse SEARCH/REPLACE edit blocks out of the model's response
  -> validator.py     : confirm every SEARCH block matches the file's current content
  -> applier.py       : write the validated edits to disk (all-or-nothing per batch)
  -> verifier.py      : optionally run a test command, pass/fail
  -> vcs.py           : git commit on success
  -> SessionHistory updates, loop continues for the next instruction

On any failure (bad format, failed validation, failed test), the specific
error is fed back into the next model call, up to `max_retries` attempts,
before the orchestrator gives up and reports why.

## Key Design Decisions

**SEARCH/REPLACE diffs, not full-file rewrites.** Smaller output per turn
(faster on CPU), and far safer -- a small targeted diff can't silently drop
code the model "forgot" to reproduce, the way a full-file regeneration can.

**Tree-sitter repo map, not full-codebase context.** Gives the model
structural awareness of the whole project (file tree + symbol signatures)
at a fraction of the token cost of sending every file's full content.

**Keyword-overlap retrieval (v1).** Deterministic, debuggable, zero extra
infrastructure. Known limitation: an instruction that doesn't share
vocabulary with the relevant files can be missed -- the planned next
iteration is embeddings-based retrieval.

**Validate before ever writing to disk, all-or-nothing per batch.** A
local model's SEARCH block occasionally doesn't exactly match current file
content. Catching that before writing prevents corrupting a file, and
rejecting the whole batch (rather than partially applying it) avoids
leaving the codebase in an inconsistent half-edited state from one
instruction.

**Bounded retries with real error feedback.** Local models are less
reliable than hosted frontier models at strict output-format compliance.
Feeding the exact failure (bad format / failed test) back into the next
attempt is the standard self-correction pattern -- a hard cap stops a bad
instruction from looping forever.

**Git commit per successful instruction.** The model is writing directly
to disk; a commit per change makes every edit reviewable and trivially
revertible.

**Model choice is a config value, not a code dependency.** `llm_client.py`
only knows a model name string; `config.yaml` is the only place that
changes when swapping between models (tested against Devstral,
Qwen2.5-Coder at multiple sizes, Qwen3.6-27B, and gpt-oss-20b during
development, each with real tradeoffs between RAM footprint, CPU speed,
and agentic-coding benchmark performance such as SWE-bench Verified).

## Configuration

`config.yaml`:
- `model` -- the Ollama model tag to use.
- `ollama_base_url` -- defaults to the local Ollama OpenAI-compatible endpoint.
- `max_retries` -- bounded self-correction attempts per instruction.

## Known Limitations

- Keyword retrieval can miss semantically relevant files that share no
  vocabulary with the instruction.
- No install/build/execution step -- a scaffolded new feature's format is
  validated, but not that it actually compiles or runs, unless a test
  command is explicitly configured.
- The model does not call tools itself; it only ever sees what the
  orchestrator decides to hand it.
- `retrieval.py`'s file cap (currently top 5) can be smaller than what a
  multi-file feature actually needs as reference context.
- Session history is a plain-text summary of past turns, not a
  ground-truth diff -- a reasonable v1 shortcut, not the most robust design.

## Future Work

- Embeddings-based retrieval instead of keyword overlap.
- Let the model request additional file context itself (true tool-calling)
  rather than the orchestrator deciding up front.
- An execution/build verification step for scaffolding tasks, not just
  format validation.
- Session history sourced from actual git diffs rather than a text summary.
