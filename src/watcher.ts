import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { generateTestFromJiraIssue } from './agent';
import { execSync } from 'child_process';
import * as fs from 'fs';

const client = axios.create({
  baseURL: `${process.env.JIRA_BASE_URL}/rest/api/3`,
  auth: {
    username: process.env.JIRA_EMAIL!,
    password: process.env.JIRA_API_TOKEN!,
  },
});

const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${process.env.TOKEN_CUSTOM_GITHUB}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

const WEBSITE_URL = process.env.TEST_WEBSITE_URL ?? 'https://www.saucedemo.com';
const JIRA_PROJECT = process.env.JIRA_PROJECT ?? 'SCRUM';
const AUTOMATED_LABEL = 'automated';
const GITHUB_REPO = process.env.REPO_GITHUB ?? 'rajkumarpagada/ai-test-agent';

// ─── Find new tickets ─────────────────────────────────────────────────────────
async function getNewTickets(): Promise<any[]> {
  console.log('\n🔍 Searching for new Jira tickets...');
  const jql = `project = ${JIRA_PROJECT} AND (labels is EMPTY OR labels != "${AUTOMATED_LABEL}") AND status = "To Do" AND issueType = Story ORDER BY created DESC`;
  const { data } = await client.get('/search/jql', {
    params: { jql, maxResults: 10, fields: 'summary,description,labels,status' },
  });
  console.log(`✅ Found ${data.issues.length} new ticket(s) to automate`);
  return data.issues;
}

// ─── Label ticket as automated ───────────────────────────────────────────────
async function labelTicketAsAutomated(issueKey: string): Promise<void> {
  await client.put(`/issue/${issueKey}`, {
    update: { labels: [{ add: AUTOMATED_LABEL }] },
  });
  console.log(`🏷️  Labelled ${issueKey} as "automated" in Jira`);
}

// ─── Post results to Jira ────────────────────────────────────────────────────
async function postResultsToJira(issueKey: string, passed: boolean, specFile: string): Promise<void> {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  await client.post(`/issue/${issueKey}/comment`, {
    body: {
      type: 'doc', version: 1,
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: `🤖 AI Test Agent Results — ${status} | File: ${specFile} | Date: ${new Date().toISOString()}` }]
      }]
    }
  });
  console.log(`💬 Posted results to Jira: ${issueKey}`);
}

// ─── Git operations ───────────────────────────────────────────────────────────
function runGit(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (err: any) {
    console.error(`Git error: ${err.message}`);
    return '';
  }
}

async function createBranchAndPR(issueKey: string, specFile: string, summary: string): Promise<void> {
  const branchName = `feature/${issueKey.toLowerCase()}-auto-generated`;

  console.log(`\n🌿 Creating branch: ${branchName}`);

  // Configure git
  runGit('git config user.email "ai-agent@automation.com"');
  runGit('git config user.name "AI Test Agent"');

  // Make sure we're on main and up to date
  runGit('git checkout main');
  runGit('git pull origin main');

  // Create new branch
  runGit(`git checkout -b ${branchName}`);

  // Add the generated test files
  runGit(`git add tests/${issueKey}/`);

  // Check if there's anything to commit
  const status = runGit('git status --porcelain');
  if (!status) {
    console.log('⚠️  No changes to commit');
    runGit('git checkout main');
    return;
  }

  // Commit
  runGit(`git commit -m "feat: auto-generated tests for ${issueKey} - ${summary}"`);

  // Push branch
  const repoUrl = `https://${process.env.TOKEN_CUSTOM_GITHUB}@github.com/${GITHUB_REPO}.git`;
  runGit(`git push ${repoUrl} ${branchName}`);
  console.log(`✅ Branch pushed: ${branchName}`);

  // Raise PR via GitHub API
  console.log(`\n📬 Raising PR on GitHub...`);
  const [owner, repo] = GITHUB_REPO.split('/');
  const prResponse = await githubClient.post(`/repos/${owner}/${repo}/pulls`, {
    title: `🤖 Auto-generated tests for ${issueKey}: ${summary}`,
    body: `## AI Test Agent — Auto Generated\n\n**Jira Ticket:** ${issueKey}\n**Summary:** ${summary}\n**Test File:** ${specFile}\n\n### What was automated:\n- Test cases generated from Jira acceptance criteria\n- Playwright automation scripts created\n- Tests verified and passing\n\n*Generated automatically by AI Test Agent*`,
    head: branchName,
    base: 'main',
  });

  console.log(`✅ PR raised: ${prResponse.data.html_url}`);

  // Go back to main
  runGit('git checkout main');
}

// ─── Run tests ────────────────────────────────────────────────────────────────
function runTests(specFile: string): boolean {
  try {
    console.log(`\n▶️  Running tests: ${specFile}`);
    execSync(`npx playwright test ${specFile} --reporter=list`, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 AI Test Agent Watcher Starting...');
  console.log(`   Project  : ${JIRA_PROJECT}`);
  console.log(`   Website  : ${WEBSITE_URL}`);
  console.log(`   Repo     : ${GITHUB_REPO}`);
  console.log(`   Time     : ${new Date().toISOString()}`);

  const tickets = await getNewTickets();

  if (tickets.length === 0) {
    console.log('\n😴 No new tickets found. Agent going back to sleep.');
    return;
  }

  const results: { key: string; passed: boolean }[] = [];

  for (const ticket of tickets) {
    const issueKey = ticket.key;
    const summary = ticket.fields.summary;
    console.log(`\n📋 Processing: ${issueKey} — ${summary}`);

    try {
      // Step 1 & 2: Generate test cases and Playwright code
      const specFile = await generateTestFromJiraIssue(issueKey, WEBSITE_URL);

      // Step 3: Run the tests
      const passed = runTests(specFile);

      // Step 4: Post results to Jira
      await postResultsToJira(issueKey, passed, specFile);

      // Step 5: Label as automated
      await labelTicketAsAutomated(issueKey);

      // Step 6: Create branch and raise PR automatically
      await createBranchAndPR(issueKey, specFile, summary);

      results.push({ key: issueKey, passed });

    } catch (err: any) {
      console.error(`❌ Error processing ${issueKey}: ${err.message}`);
      results.push({ key: issueKey, passed: false });
    }
  }

  // Summary
  console.log('\n📊 Daily Summary:');
  console.log(`   Total tickets processed: ${results.length}`);
  console.log(`   Passed: ${results.filter(r => r.passed).length} ✅`);
  console.log(`   Failed: ${results.filter(r => !r.passed).length} ❌`);
  results.forEach(r => console.log(`   ${r.key}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}`));
}

main().catch(console.error);
