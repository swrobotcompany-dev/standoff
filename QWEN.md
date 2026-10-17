# Standoff — Qwen Code instructions

## Project
- A browser-based 3D FPS prototype, currently implemented in a single HTML file: `станок 0.5.html`.
- It uses Three.js from a CDN. There is no package manager, build script, or test suite in this repository.
- Make minimal, task-focused changes. Do not overwrite the full game or introduce a build system unless requested.

## Required GitHub workflow for every coding task
1. Read the current `main` branch and check the working tree before editing.
2. Create a **new branch from up-to-date `main`**, named `qwen/<short-description>`. Never commit task changes straight into `main`.
3. Make and validate changes. For HTML/JavaScript changes, at least inspect the script for syntax errors and manually test in a browser when available. Do not claim a browser test ran if it did not.
4. Commit with a descriptive message, using a real configured Git author identity (never the example `Ваше Имя <you@example.com>`).
5. Push the feature branch to the correct repository: `swrobotcompany-dev/standoff`.
6. **Create a pull request to `main`** (for example, `gh pr create --repo swrobotcompany-dev/standoff --base main --head <branch> --title "..." --body "..."`).
7. Verify that a PR exists, and include its clickable URL in your final answer. Do not report success merely because a local commit or push succeeded.

## When a pull request cannot be created
- Show the *exact* error to the user instead of silently skipping the PR.
- Check `git remote -v`, `git status`, `git branch --show-current`, `git config user.name`, `git config user.email`, `gh auth status`, and `gh repo view swrobotcompany-dev/standoff`.
- Check whether the agent's GitHub token/app is allowed to write **Contents** and **Pull requests** for this repository. Permission to read a public repository is not sufficient.
- If `gh` is unavailable or not authenticated, explain that credentials must be configured in the agent's execution environment; do not ask to paste tokens into code or commits.
- Do not force-push `main`, merge your own PR, or delete existing branches without explicit authorization.

These instructions guide Qwen Code only: a `QWEN.md` file does **not** install a GitHub integration, authorize an agent, or automatically open pull requests.
