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

export default function CustomSearchDialog(props: SharedProps) {

  const { search, setSearch, query } = useDocsSearch({
    type: 'fetch'
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
        {/* <SearchDialogFooter>
          <a
            href="https://orama.com"
            rel="noreferrer noopener"
            className="ms-auto text-xs text-fd-muted-foreground"
          >
            Search powered by Orama
          </a>
        </SearchDialogFooter> */}
      </SearchDialogContent>
    </SearchDialog>
  );
}