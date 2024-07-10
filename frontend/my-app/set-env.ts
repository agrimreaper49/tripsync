const { writeFileSync } = require('fs');
const { resolve } = require('path');
const dotenv = require('dotenv');
dotenv.config();

const targetPath = resolve(__dirname, './src/environments/environment.ts');
const envConfigFile = `export const environment = {
  production: false,
  geminiApiKey: '${process.env.GEMINI_API_KEY}',
};`;

writeFileSync(targetPath, envConfigFile, { encoding: 'utf8' });

console.log(`Output generated at ${targetPath}`);
