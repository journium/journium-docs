import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/notebook/page';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { NextJsIcon } from '@/components/icons/nextjs';
import { ReactIcon } from '@/components/icons/react';
import { JsIcon } from '@/components/icons/js';
import { JourniumIcon } from '@/components/ui/journium-icon';

interface DocsIndexPageProps {
  title: string;
  description?: string;
}

export function DocsIndexPage({ title, description }: DocsIndexPageProps) {
  return (
    <DocsPage full>
      <DocsBody className="p-0 -mx-8 -mt-14 max-w-none">
        {/* Hero Section - Full Width */}
        <div className="relative mb-12 overflow-hidden bg-linear-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-400/30 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
          </div>

          {/* Journium Icon - Top Right Corner */}
          <div className="absolute top-12 right-10 md:top-12 md:right-8 z-20 opacity-30 dark:opacity-20 hover:opacity-50 dark:hover:opacity-40 transition-opacity duration-300">
            <JourniumIcon 
              size="lg" 
              className="md:h-20 md:w-20 lg:h-24 lg:w-24" 
              variant="default"
            />
          </div>

          {/* Content - Constrained */}
          <div className="relative  mx-auto max-w-7xl px-6 py-12 md:py-16">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Documentation
              </div>

              <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold bg-linear-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                {title}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {description}
              </p>

              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                Journium turns raw telemetry into proactive, narrative insights — without charts, queries, or BI.
              </p>
            </div>
          </div>

          {/* Decorative grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]" />
        </div>

        {/* Getting Started Section */}
        <div className="mx-0 max-w-7xl px-6 w-full">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Get Started
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8">
            Find the right guide for your needs, whether you are just getting started or looking to implement advanced features.
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
        </div>
      </DocsBody>
    </DocsPage>
  );
}
