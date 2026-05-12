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

async function test() {
  const { data } = await client.get('/issue/SCRUM-6');
  console.log(JSON.stringify(data.fields.description, null, 2));
}

test().catch(console.error);
