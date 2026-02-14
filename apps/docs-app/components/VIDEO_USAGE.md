## Video component usage

### In a fixed width container (in a mdx file)

- Centralized in the container

```tsx
<div className="max-w-[400px] mx-auto my-8">
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
<div className="max-w-[400px] ml-auto my-8">
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
<div className="max-w-[400px] mr-auto my-8">
  <Video 
    type="youtube"
    src="LC69yooyulo"
    width={560}
    height={315}
    className="border rounded-xl shadow-lg"
  />
</div>
```

- Full width

```tsx
<Video 
    type="youtube"
    src="LC69yooyulo"
     width={560}
     height={315}
     className="mt-6 rounded-xl"
/>
```

### Using standard Tailwind width utilities

If you prefer standard Tailwind sizes, you can use predefined utilities:

```tsx
<!-- max-w-sm = 384px -->
<div className="max-w-sm mx-auto my-8">
  <Video type="youtube" src="LC69yooyulo" />
</div>

<!-- max-w-md = 448px -->
<div className="max-w-md mx-auto my-8">
  <Video type="youtube" src="LC69yooyulo" />
</div>

<!-- max-w-lg = 512px -->
<div className="max-w-lg mx-auto my-8">
  <Video type="youtube" src="LC69yooyulo" />
</div>

<!-- max-w-xl = 576px -->
<div className="max-w-xl mx-auto my-8">
  <Video type="youtube" src="LC69yooyulo" />
</div>

<!-- max-w-2xl = 672px -->
<div className="max-w-2xl mx-auto my-8">
  <Video type="youtube" src="LC69yooyulo" />
</div>

<!-- max-w-3xl = 768px -->
<div className="max-w-3xl mx-auto my-8">
  <Video type="youtube" src="LC69yooyulo" />
</div>
```