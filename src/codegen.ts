import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
dotenv.config();

const targetUrl = process.argv[2] ?? 'https://kayosports.com.au';
const outputFile = process.argv[3] ?? 'tests/recorded.spec.ts';

console.log(`🎬 Launching Playwright Codegen for: ${targetUrl}`);
console.log(`   Recorded test will be saved to: ${outputFile}\n`);

execSync(
  `npx playwright codegen --target typescript -o ${outputFile} ${targetUrl}`,
  { stdio: 'inherit' }
);
