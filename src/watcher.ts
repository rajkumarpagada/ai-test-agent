import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { generateTestFromJiraIssue } from './agent';
import { execSync } from 'child_process';

const client = axios.create({
  baseURL: `${process.env.JIRA_BASE_URL}/rest/api/3`,
  auth: {
    username: process.env.JIRA_EMAIL!,
    password: process.env.JIRA_API_TOKEN!,
  },
});

const WEBSITE_URL = process.env.TEST_WEBSITE_URL ?? 'https://www.saucedemo.com';
const JIRA_PROJECT = process.env.JIRA_PROJECT ?? 'SCRUM';
const AUTOMATED_LABEL = 'automated';

// ─── Find new tickets ready for automation ───────────────────────────────────
async function getNewTickets(): Promise<any[]> {
  console.log('\n🔍 Searching for new Jira tickets...');

  const jql = `project = ${JIRA_PROJECT} AND (labels is EMPTY OR labels != "${AUTOMATED_LABEL}") AND status = "To Do" AND issueType = Story ORDER BY created DESC`;

  const { data } = await client.get('/search/jql', {
    params: {
      jql,
      maxResults: 10,
      fields: 'summary,description,labels,status',
    },
  });

  console.log(`✅ Found ${data.issues.length} new ticket(s) to automate`);
  return data.issues;
}

// ─── Label ticket as automated in Jira ───────────────────────────────────────
async function labelTicketAsAutomated(issueKey: string): Promise<void> {
  await client.put(`/issue/${issueKey}`, {
    update: {
      labels: [{ add: AUTOMATED_LABEL }],
    },
  });
  console.log(`🏷️  Labelled ${issueKey} as "automated" in Jira`);
}

// ─── Post test results back to Jira as a comment ─────────────────────────────
async function postResultsToJira(issueKey: string, passed: boolean, specFile: string): Promise<void> {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  const comment = {
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `🤖 AI Test Agent Results — ${status}`,
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `Test file: ${specFile}`,
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `Run date: ${new Date().toISOString()}`,
            },
          ],
        },
      ],
    },
  };

  await client.post(`/issue/${issueKey}/comment`, comment);
  console.log(`💬 Posted results to Jira: ${issueKey}`);
}

// ─── Run Playwright tests for a spec file ────────────────────────────────────
function runTests(specFile: string): boolean {
  try {
    console.log(`\n▶️  Running tests: ${specFile}`);
    execSync(`npx playwright test ${specFile} --reporter=list`, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

// ─── Main watcher loop ────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 AI Test Agent Watcher Starting...');
  console.log(`   Project  : ${JIRA_PROJECT}`);
  console.log(`   Website  : ${WEBSITE_URL}`);
  console.log(`   Time     : ${new Date().toISOString()}`);

  const tickets = await getNewTickets();

  if (tickets.length === 0) {
    console.log('\n😴 No new tickets found. Agent going back to sleep.');
    return;
  }

  const results: { key: string; passed: boolean }[] = [];

  for (const ticket of tickets) {
    const issueKey = ticket.key;
    console.log(`\n📋 Processing: ${issueKey} — ${ticket.fields.summary}`);

    try {
      // Generate test cases and Playwright code
      const specFile = await generateTestFromJiraIssue(issueKey, WEBSITE_URL);

      // Run the tests
      const passed = runTests(specFile);

      // Post results back to Jira
      await postResultsToJira(issueKey, passed, specFile);

      // Label as automated in Jira
      await labelTicketAsAutomated(issueKey);

      results.push({ key: issueKey, passed });

    } catch (err: any) {
      console.error(`❌ Error processing ${issueKey}: ${err.message}`);
      results.push({ key: issueKey, passed: false });
    }
  }

  // Print summary
  console.log('\n📊 Daily Summary:');
  console.log(`   Total tickets processed: ${results.length}`);
  console.log(`   Passed: ${results.filter(r => r.passed).length} ✅`);
  console.log(`   Failed: ${results.filter(r => !r.passed).length} ❌`);
  results.forEach(r => {
    console.log(`   ${r.key}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}`);
  });
}

main().catch(console.error);
