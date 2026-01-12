'use client';

import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { OramaCloud } from '@orama/core';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useMemo } from 'react';

export default function CustomSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n
  
  const client = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_ORAMA_PROJECT_ID || !process.env.NEXT_PUBLIC_ORAMA_API_KEY) {
      // Return a dummy client for builds without env vars (e.g., PR builds)
      return new OramaCloud({
        projectId: 'dummy',
        apiKey: 'dummy',
      });
    }
    return new OramaCloud({
      projectId: process.env.NEXT_PUBLIC_ORAMA_PROJECT_ID,
      apiKey: process.env.NEXT_PUBLIC_ORAMA_API_KEY,
    });
  }, []);

  const { search, setSearch, query } = useDocsSearch({
    type: 'orama-cloud',
    client,
    locale,
  });

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
        <SearchDialogFooter>
          <a
            href="https://orama.com"
            rel="noreferrer noopener"
            className="ms-auto text-xs text-fd-muted-foreground"
          >
            Search powered by Orama
          </a>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}