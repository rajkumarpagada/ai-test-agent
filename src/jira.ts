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

export async function getIssueAcceptanceCriteria(issueKey: string): Promise<string> {
  const { data } = await client.get(`/issue/${issueKey}`);
  const description = data.fields.description;
  return extractTextFromADF(description);
}

function extractTextFromADF(node: any): string {
  if (!node) return '';

  // Base case — text node
  if (node.type === 'text') {
    return node.text ?? '';
  }

  // Recursively extract from all children
  if (node.content && Array.isArray(node.content)) {
    const childText = node.content.map(extractTextFromADF).join('');

    // Add numbering for list items
    if (node.type === 'listItem') {
      return `\n- ${childText.trim()}`;
    }

    // Add newline after paragraphs and headings
    if (node.type === 'paragraph' || node.type === 'heading') {
      return `${childText.trim()}\n`;
    }

    return childText;
  }

  return '';
}
