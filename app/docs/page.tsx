import { Card, Cards } from 'fumadocs-ui/components/card';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/layouts/notebook/page';
import { NextJsIcon } from '@/components/icons/nextjs';
import { ReactIcon } from '@/components/icons/react';
import { JsIcon } from '@/components/icons/js';
import type { Metadata } from 'next';

export default function MainDocsPage() {
  return (
    <DocsPage>
      <DocsTitle>Journium Docs</DocsTitle>
      <DocsDescription>
        Add tracking to your application and get insights from your data in minutes.
      </DocsDescription>
      
      <DocsBody>
        <p>
          Journium turns raw telemetry into proactive, narrative insights — without charts, queries, or BI.
        </p>
        <p>
          Find the right guide for your needs, whether you are just getting stated or looking to implement advanced features.
        </p>
        
        <Cards>
          <Card 
            title="Next.js" 
            icon={<NextJsIcon className="w-5 h-5" />} 
            href="/docs/quick-start"
          >
            Get started with Journium in your Next.js application
          </Card>
          <Card 
            title="React" 
            icon={<ReactIcon className="w-5 h-5" />} 
            href="/docs/react"
          >
            Integrate Journium into your React application
          </Card>
          <Card 
            title="JavaScript" 
            icon={<JsIcon className="w-5 h-5" />} 
            href="/docs/js"
          >
            Add Journium tracking to your vanilla JavaScript application
          </Card>
        </Cards>
      </DocsBody>
    </DocsPage>
  );
}

export const metadata: Metadata = {
  title: 'Journium Docs',
  description: 'Add tracking to your application and get insights from your data in minutes.',
};