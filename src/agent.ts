import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { getIssueAcceptanceCriteria } from './jira';
import * as dotenv from 'dotenv';
dotenv.config();

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateTestCases(acceptanceCriteria: string, issueKey: string): Promise<string> {
  console.log(`\n🧠 Step 1: Generating test cases from acceptance criteria...`);

  const message = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `You are a senior QA engineer.

Generate ONLY positive test cases for the following acceptance criteria.
Maximum 3 positive test cases. Keep each one short and concise.

Format exactly like this:
TC001 - [Title]
  Type: Positive
  Given: [precondition]
  When: [action]
  Then: [expected result]

Acceptance Criteria:
${acceptanceCriteria}`,
      },
    ],
  });

  const testCases = (message.content[0] as any).text;
  const outputDir = path.join('tests', issueKey);
  fs.mkdirSync(outputDir, { recursive: true });
  const testCasesPath = path.join(outputDir, 'test-cases.md');
  fs.writeFileSync(testCasesPath, `# Test Cases for ${issueKey}\n\n${testCases}`);
  console.log(`✅ Test cases written to: ${testCasesPath}`);

  return testCases;
}

async function generatePlaywrightCode(
  testCases: string,
  issueKey: string,
  websiteUrl: string
): Promise<string> {
  console.log(`\n⚡ Step 2: Converting test cases to Playwright code...`);

  const message = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are a senior automation engineer.

Convert ONLY the test cases below into a Playwright TypeScript test file.
Do NOT add any extra test cases.

Rules:
1. Each test case becomes one test block
2. Use resilient selectors (aria-label, role, data-testid preferred)
3. Read credentials from environment variables only:
   - process.env.KAYO_EMAIL
   - process.env.KAYO_PASSWORD
4. Add meaningful assertions for each Then statement
5. Handle async navigation with waitForURL or waitForSelector
6. Use ONE simple Page Object class only
7. Keep code concise - no unnecessary comments
8. Do NOT use template literals with backticks for strings
9. Do NOT wrap code in markdown fences

Website: ${websiteUrl}

Test Cases:
${testCases}

Return ONLY valid TypeScript code. No markdown, no explanation.`,
      },
    ],
  });

  const playwrightCode = (message.content[0] as any).text;
  const outputPath = path.join('tests', issueKey, `${issueKey}.spec.ts`);
  fs.writeFileSync(outputPath, playwrightCode);
  console.log(`✅ Playwright test written to: ${outputPath}`);

  return outputPath;
}

export async function generateTestFromJiraIssue(issueKey: string, websiteUrl: string) {
  console.log(`\n📋 Fetching acceptance criteria from Jira: ${issueKey}`);
  const acceptanceCriteria = await getIssueAcceptanceCriteria(issueKey);

  if (!acceptanceCriteria) {
    throw new Error(`No acceptance criteria found in Jira issue: ${issueKey}`);
  }

  console.log(`\n✅ Acceptance Criteria found:\n${acceptanceCriteria}`);

  const testCases = await generateTestCases(acceptanceCriteria, issueKey);
  console.log(`\n📝 Test Cases Generated:\n${testCases}`);

  const specFilePath = await generatePlaywrightCode(testCases, issueKey, websiteUrl);

  return specFilePath;
}
