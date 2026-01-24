/**
 * A version of docs for AIs to read.
 * It includes the processed markdown for each page, which is the markdown that has been processed by the markdown processor.
 * 
 * See https://www.fumadocs.dev/docs/integrations/llms#llms-fulltxt
 */
import { source } from '@/lib/source';
import { getLLMText } from '@/lib/get-llm-text';

// cached forever
export const revalidate = false;

export async function GET() {
  // @ts-expect-error - getText method exists at runtime but TypeScript types are not aware
  const scan = source.getPages().map(getLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join('\n\n'));
}