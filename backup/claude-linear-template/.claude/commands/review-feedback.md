---
name: review-feedback
description: Address PR review comments from GitHub, push fixes, request re-review
---

Address PR review feedback: $ARGUMENTS

## Process

### 1. Fetch review comments
- Read `.claude/state.json` for the PR URL, or use $ARGUMENTS if a PR number/URL is given
- Fetch PR reviews and comments: `gh pr view [number] --comments --json reviews,comments`
- Fetch inline review comments: `gh api repos/{owner}/{repo}/pulls/{number}/comments`
- Group by: resolved vs unresolved

### 2. Analyze each comment
For each unresolved comment:
- Identify the file and line(s) referenced
- Read the surrounding code for context
- Classify as:
  - **Fix**: clear code change needed
  - **Discussion**: needs my input before acting
  - **Nit**: optional improvement

Show the categorized list and ask me which to address (default: all fixes + nits, flag discussions for my input).

### 3. Implement fixes
For each comment to address:
- Make the code change
- Check `.claude/learnings/` for relevant context
- If the review comment reveals a non-obvious pattern or gotcha, create a learning

### 4. Verify
- Run linting
- Run tests for changed files
- Fix any new failures

### 5. Commit and push
Commit all review fixes together:
```bash
git commit -m "fix(review): address PR feedback [ISSUE-ID]

- [summary of each fix]"
git push
```

### 6. Respond on GitHub
For each addressed comment, reply via `gh api`:
```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments/{id}/replies \
  -f body="Fixed in [commit-sha] — [brief description of change]"
```

### 7. Request re-review
```bash
gh pr edit [number] --add-reviewer [original-reviewer]
```

### 8. Update Linear
Add a comment on the Linear issue:
"Addressed N/M review comments. Waiting for re-review."

Update `.claude/state.json` with `lastActivityTimestamp`.
