type LlmPage = {
  data: {
    title: string;
    getText: (kind: 'processed' | 'raw') => Promise<string>;
  };
  url: string;
};

export async function getLLMText(page: LlmPage) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}