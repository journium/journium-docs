## Video component usage

### In a fixed width container (in a mdx file)

- Centralized in the container

```tsx
<div className="mx-auto my-8" style={{ maxWidth: '400px' }}>
  <Video 
    type="youtube"
    src="LC69yooyulo"
    width={560}
    height={315}
    className="border rounded-xl shadow-lg"
  />
</div>
```

- Right-aligned in the container

```tsx
<div className="ml-auto my-8" style={{ maxWidth: '400px' }}>
  <Video 
    type="youtube"
    src="LC69yooyulo"
    width={560}
    height={315}
    className="border rounded-xl shadow-lg"
  />
</div>
```

- Left-aligned in the container (default)

```tsx
<div className="mr-auto my-8" style={{ maxWidth: '400px' }}>
  <Video 
    type="youtube"
    src="LC69yooyulo"
    width={560}
    height={315}
    className="border rounded-xl shadow-lg"
  />
</div>
```