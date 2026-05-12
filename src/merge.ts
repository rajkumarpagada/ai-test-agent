import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function mergeTests(aiGenerated: string, recorded: string, output: string) {
  const gen = fs.readFileSync(aiGenerated, 'utf-8');
  const rec = fs.readFileSync(recorded, 'utf-8');

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Merge these two Playwright TypeScript test files into one production-quality spec.
Use the selectors from the recorded file (more accurate) but the test logic and assertions from the AI-generated file (more thorough).
Remove duplicates. Return ONLY the merged TypeScript code.

AI-GENERATED:
${gen}

RECORDED:
${rec}`,
    }],
  });

  fs.writeFileSync(output, (msg.content[0] as any).text);
  console.log(`✅ Merged test saved to: ${output}`);
}
