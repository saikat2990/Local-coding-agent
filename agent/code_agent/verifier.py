import subprocess


def run_tests(repo_path, test_cmd=None):
    if not test_cmd:
        return True, "(no test command configured, skipped)"
    result = subprocess.run(test_cmd, shell=True, cwd=repo_path, capture_output=True, text=True)
    return result.returncode == 0, (result.stdout + result.stderr)
