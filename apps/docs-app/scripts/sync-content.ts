import * as fs from 'node:fs/promises';
import { config } from 'dotenv';
import { OramaCloud } from '@orama/core';

// Load environment variables from .env file
config();

// Dynamic import to work around tsx package exports resolution issue
let sync: (orama: OramaCloud, options: { index: string; documents: OramaDocument[] }) => Promise<void>;
type OramaDocument = {
  id: string;
  title: string;
  description?: string;
  url: string;
  structured: {
    headings: Array<{ id: string; content: string }>;
    contents: Array<{ heading: string | undefined; content: string }>;
  };
  tag?: string;
  extra_data?: object;
  breadcrumbs?: string[];
};

async function loadModules() {
  const oramaCloudModule = await import('fumadocs-core/search/orama-cloud');
  sync = oramaCloudModule.sync;
}

// the path of pre-rendered `static.json`, choose one according to your React framework
const filePath = {
  next: '.next/server/app/static.json.body',
  'tanstack-start': '.output/public/static.json',
  'react-router': 'build/client/static.json',
  waku: 'dist/public/static.json',
}['next'];

async function main() {
  await loadModules();
  
  const orama = new OramaCloud({
    projectId: process.env.NEXT_PUBLIC_ORAMA_PROJECT_ID!,
    apiKey: process.env.ORAMA_PRIVATE_API_KEY!,
  });

  const content = await fs.readFile(filePath);
  const records = JSON.parse(content.toString()) as OramaDocument[];

  await sync(orama, {
    index: process.env.NEXT_PUBLIC_ORAMA_DATASOURCE_ID!,
    documents: records,
  });

  console.log(`search updated: ${records.length} records`);
}

void main();