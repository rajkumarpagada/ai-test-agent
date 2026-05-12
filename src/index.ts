import { generateTestFromJiraIssue } from './agent';
import * as dotenv from 'dotenv';
dotenv.config();

const issueKey = process.argv[2];
const websiteUrl = process.argv[3] ?? 'https://kayosports.com.au';

if (!issueKey) {
  console.error('❌ Please provide a Jira issue key.');
  console.error('   Usage: npx tsx src/index.ts PROJ-123 https://kayosports.com.au');
  process.exit(1);
}

console.log('🚀 AI Test Agent Starting...');
console.log(`   Jira Issue : ${issueKey}`);
console.log(`   Website    : ${websiteUrl}`);

generateTestFromJiraIssue(issueKey, websiteUrl)
  .then(specFile => {
    console.log(`\n🎉 All done! Two files created:`);
    console.log(`   📝 Test cases : tests/${issueKey}/test-cases.md`);
    console.log(`   ⚡ Playwright  : ${specFile}`);
    console.log(`\n▶️  Review test cases, then run:`);
    console.log(`   npx playwright test ${specFile}`);
  })
  .catch(err => {
    console.error(`\n❌ Error: ${err.message}`);
    process.exit(1);
  });
