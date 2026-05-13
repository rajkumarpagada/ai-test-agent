import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
  baseURL: `${process.env.JIRA_BASE_URL}/rest/api/3`,
  auth: {
    username: process.env.JIRA_EMAIL!,
    password: process.env.JIRA_API_TOKEN!,
  },
});

async function check() {
  const { data } = await client.get('/issue/SCRUM-8');
  console.log('Status:', data.fields.status.name);
  console.log('Labels:', data.fields.labels);

  // Also get all available statuses
  const { data: statuses } = await client.get('/search/jql', {
    params: {
      jql: 'project = SCRUM ORDER BY created DESC',
      maxResults: 10,
      fields: 'summary,status,labels',
    },
  });

  console.log('\nAll tickets and their statuses:');
  statuses.issues.forEach((issue: any) => {
    console.log(`${issue.key} — Status: "${issue.fields.status.name}" — Labels: ${JSON.stringify(issue.fields.labels)}`);
  });
}

check().catch(console.error);
