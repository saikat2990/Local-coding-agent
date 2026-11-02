from dataclasses import dataclass, field
from pathlib import Path

HISTORY_WINDOW = 5

SYSTEM_RULES = """You are a coding agent. You will be given a repo map, the content \
of selected files, recent edit history, and a new instruction.

Respond ONLY with one or more edit blocks, using the exact SEARCH/REPLACE shape shown \
in the examples below. Never write plain code, explanations, markdown fences, \
placeholder text, or separators like "---" between blocks -- output ONLY the edit \
blocks themselves, back to back, with nothing else.

Rules:
- Each edit block opens with a line "<<<<<<< SEARCH: " followed by the file's relative
  path, then the exact existing code to find (or nothing at all, for a new file), then
  a line containing only "=======", then the new code, then a line containing only
  ">>>>>>> REPLACE".
- SEARCH text must match the file's current content exactly, including whitespace.
- Keep each SEARCH block as small as possible while still unique in the file.
- If creating a new file, leave the SEARCH section completely empty -- nothing between
  the SEARCH line and the "=======" line.
- For a task needing multiple files, output multiple edit blocks back to back, each one
  complete and correctly tagged. Never skip the tags, and never separate blocks with
  anything other than the tags themselves.
- Produce exactly one version of each file's change. Never offer alternatives, options,
  or multiple drafts.
- If an instruction is vague about implementation details (e.g. which fields or methods
  to include), make a reasonable choice consistent with the existing codebase patterns
  shown to you, rather than leaving placeholders or asking for clarification.
- Before writing a SEARCH block for any file, check whether that file already appears in
  the SELECTED FILES content above. If it does not appear there, the file does not exist
  yet -- you are creating it, not editing it. In that case the SEARCH section MUST be
  completely empty. Never invent, guess, or hallucinate placeholder "existing" content
  to search for in a file that has not been shown to you as already existing. "REPLACE"
  in the block name does not mean every file must already exist -- it only describes
  what goes in its place, whether that place was empty (new file) or had prior content
  (edit).

Example 1 -- editing an existing file:
<<<<<<< SEARCH: src/controllers/health.controller.ts
export async function health(req: Request, res: Response): Promise<void> {
  res.status(200).json({ status: "ok" });
}
=======
export async function health(req: Request, res: Response): Promise<void> {
  console.log("health check called");
  res.status(200).json({ status: "ok" });
}
>>>>>>> REPLACE

Example 2 -- creating a brand new file (note the empty SEARCH section):
<<<<<<< SEARCH: src/controllers/category.controller.ts
=======
import { Request, Response } from "express";

export async function listCategories(req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: [] });
}
>>>>>>> REPLACE

Follow this exact shape for every file you touch or create. No placeholder text, no
separators, no explanations -- only real, complete edit blocks.
"""


@dataclass
class SessionHistory:
    turns: list = field(default_factory=list)

    def add(self, instruction, diff_summary):
        self.turns.append({"instruction": instruction, "diff": diff_summary})
        self.turns = self.turns[-HISTORY_WINDOW:]

    def as_text(self):
        if not self.turns:
            return "(no prior turns)"
        return "\n\n".join(
            f"Instruction: {t['instruction']}\nChange made:\n{t['diff']}" for t in self.turns
        )


def build_prompt(repo_map_text, selected_files, repo_path, instruction, history: SessionHistory):
    file_blocks = []
    for f in selected_files:
        content = (Path(repo_path) / f).read_text(errors="ignore")
        file_blocks.append(f"--- {f} ---\n{content}")
    return (
        f"REPO MAP:\n{repo_map_text}\n\n"
        f"SELECTED FILES:\n{chr(10).join(file_blocks)}\n\n"
        f"RECENT HISTORY:\n{history.as_text()}\n\n"
        f"NEW INSTRUCTION:\n{instruction}"
    )
