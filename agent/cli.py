import yaml
from pathlib import Path

from code_agent.llm_client import make_client
from code_agent.prompting import SessionHistory
from code_agent.orchestrator import generate_code


def load_config():
    cfg_path = Path(__file__).parent / "config.yaml"
    return yaml.safe_load(cfg_path.read_text())


DEFAULT_REPO_PATH = "/home/saikat/Desktop/personal/Local-Code-Agent/sample-target-codebase"


def main():
    cfg = load_config()
    client = make_client(cfg["ollama_base_url"])
    history = SessionHistory()

    repo_path = input(f"Codebase path [{DEFAULT_REPO_PATH}]: ").strip() or DEFAULT_REPO_PATH
    test_cmd = input("Test command (blank to skip): ").strip() or None

    while True:
        instruction = input("\nInstruction (or 'exit'): ").strip()
        if instruction.lower() == "exit":
            break
        result = generate_code(
            client, cfg["model"], instruction, repo_path, history,
            test_cmd=test_cmd, max_retries=cfg["max_retries"],
        )
        if result["status"] == "success":
            print(f"\n✓ Applied and committed.\n{result['diff']}")
        else:
            print(f"\n✗ Failed: {result['reason']}")


if __name__ == "__main__":
    main()
