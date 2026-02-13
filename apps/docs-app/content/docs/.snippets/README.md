# Snippets


- Create any JSX component, e.g. `my-snippet.mdx`.

```tsx
export default function MySnippet({ word }) {
  return (
    <>
      <p>Hello world! This is my content I want to reuse across pages. My keyword of the day is {word}.</p>
      <p>test test test {word}</p>
    </>
  );
}
```

- Then import whereever you want to use, in any mdx file and use

```
import MySnippet from '../../../.snippets/my-snippet.mdx';

<MySnippet word="bananas" />
```

IMPORTANT:

If you are using <include> tags, then you need to import in the main file where the <include> tag is being used.

```
import MySnippet from '../../../.snippets/my-snippet.mdx';

<include>../../../.includes/insight_trackers/index.mdx</include>
```