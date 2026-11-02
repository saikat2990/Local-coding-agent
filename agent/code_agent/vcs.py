import subprocess


def git_commit(repo_path, message):
    subprocess.run(["git", "add", "-A"], cwd=repo_path)
    subprocess.run(["git", "commit", "-m", message], cwd=repo_path)
