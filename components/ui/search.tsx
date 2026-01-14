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
// import { AISearchTrigger } from '../ai/search';

export default function CustomSearchDialog(props: SharedProps) {

  const { search, setSearch, query } = useDocsSearch({
    type: 'fetch'
  });

  // Close the search dialog when AI trigger is clicked
  // const handleAIClick = () => {
  //   if (props.onOpenChange) {
  //     props.onOpenChange(false);
  //   }
  // };

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
        {/* <SearchDialogFooter className="flex">
          <AISearchTrigger className="ml-auto h-8 rounded-md" onClick={handleAIClick} />
        </SearchDialogFooter> */}
      </SearchDialogContent>
    </SearchDialog>
  );
}