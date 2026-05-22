# AI Test Agent

An autonomous QA agent that watches Jira for new story tickets, generates Playwright test cases using Claude AI, runs them, posts results back to Jira, and opens a GitHub PR — all without human intervention.

## How it works

```
Jira "To Do" story
        │
        ▼
  Fetch acceptance criteria
        │
        ▼
  Claude AI → test cases (TC001, TC002, …)
        │
        ▼
  Claude AI → Playwright TypeScript spec
        │
        ▼
  Run tests with Playwright
        │
        ▼
  Post results as Jira comment
  Label ticket "automated"
  Push branch + open GitHub PR
```

## Project structure

```
src/
  agent.ts      – AI pipeline: acceptance criteria → test cases → Playwright code
  watcher.ts    – Orchestrator: polls Jira, runs agent, commits, raises PR
  jira.ts       – Jira REST API client (fetch issues, post comments, add labels)
  merge.ts      – Merges AI-generated and Playwright-recorded specs via Claude
  codegen.ts    – Wrapper around `playwright codegen` for recording sessions
  index.ts      – CLI entry point for one-shot runs

tests/
  SCRUM-10/     – Auto-generated spec + test-cases.md per Jira ticket
  SCRUM-7/
  …

.github/workflows/
  playwright.yml – CI: runs watcher on schedule (21:00 UTC daily) and Playwright tests on PRs
```

## Prerequisites

- Node.js 18+
- A Jira project with stories that have acceptance criteria in the description
- An Anthropic API key
- A GitHub personal access token (repo scope)

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` (or set the variables below directly):

```env
ANTHROPIC_API_KEY=sk-ant-...
JIRA_BASE_URL=https://your-org.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT=SCRUM
TEST_WEBSITE_URL=https://www.saucedemo.com
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce
TOKEN_CUSTOM_GITHUB=ghp_...
REPO_GITHUB=owner/repo
```

## Usage

### Run the watcher (processes all unautomated tickets)

```bash
npx tsx src/watcher.ts
```

The watcher will:
1. Find all Jira stories in "To Do" without the `automated` label
2. For each ticket, generate test cases and a Playwright spec via Claude
3. Run the generated tests
4. Post a pass/fail comment on the Jira ticket and add the `automated` label
5. Create a feature branch, commit the spec, and open a PR against `main`

### One-shot run for a single ticket

```bash
npx tsx src/index.ts SCRUM-42 https://www.saucedemo.com
```

### Record a test manually (Playwright Codegen)

```bash
npx tsx src/codegen.ts https://www.saucedemo.com tests/recorded.spec.ts
```

### Merge AI-generated and recorded specs

```bash
npx tsx -e "import { mergeTests } from './src/merge'; mergeTests('tests/SCRUM-10/SCRUM-10.spec.ts', 'tests/recorded.spec.ts', 'tests/SCRUM-10/SCRUM-10.merged.spec.ts')"
```

### Run tests manually

```bash
npx playwright test tests/SCRUM-10/SCRUM-10.spec.ts
```

## CI / CD

The GitHub Actions workflow (`.github/workflows/playwright.yml`) does two things:

| Trigger | What runs |
|---|---|
| `schedule` (21:00 UTC daily) | Full watcher — generates tests for any new Jira tickets |
| `pull_request` to `main` | Playwright tests for existing spec files |

All secrets are stored in GitHub repository secrets and injected at runtime.

## Tech stack

| Tool | Role |
|---|---|
| Claude (`claude-sonnet-4-6`) | Test case generation, Playwright code generation, spec merging |
| Playwright | Test execution, browser automation, codegen |
| Jira REST API v3 | Fetch acceptance criteria, post comments, label tickets |
| GitHub API | Create branches, open pull requests |
| TypeScript + tsx | Runtime and type safety |
