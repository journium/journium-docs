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

---

## VideoPlayer component usage

The `VideoPlayer` component shows a button with a play icon. When clicked, it opens the video in a modal overlay with a blurred background.

### Basic usage

```tsx
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  title="Demo Video"
/>
```

### Button sizes

```tsx
<!-- Small button (h-8) -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  size="sm"
/>

<!-- Medium button (h-10) - default -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  size="md"
/>

<!-- Large button (h-12) -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  size="lg"
/>
```

### Button variants

```tsx
<!-- Primary variant (blue) - default -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  variant="primary"
/>

<!-- Secondary variant (gray) -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  variant="secondary"
/>

<!-- Outline variant (border only) -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  variant="outline"
/>

<!-- Icon-only variant (square button with just icon) -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  variant="icon"
/>
```

### Custom label

```tsx
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  label="Watch Demo"
  title="Product Demo"
/>
```

### Icon-only button (cleaner API)

Use `variant="icon"` for a 16:9 aspect ratio button with just the play icon:

```tsx
<!-- Using variant="icon" - recommended -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  variant="icon"
  title="Demo Video"
/>

<!-- Different sizes (all maintain ~16:9 ratio) -->
<VideoPlayer type="youtube" src="LC69yooyulo" variant="icon" size="sm" /> <!-- 32x56px -->
<VideoPlayer type="youtube" src="LC69yooyulo" variant="icon" size="md" /> <!-- 40x72px -->
<VideoPlayer type="youtube" src="LC69yooyulo" variant="icon" size="lg" /> <!-- 48x86px -->

<!-- Alternative: empty label also works -->
<VideoPlayer type="youtube" src="LC69yooyulo" label="" />
```

### Inline with text

You can place the video player button inline with text:

```tsx
Watch our quick demo <VideoPlayer type="youtube" src="LC69yooyulo" variant="icon" size="sm" /> to see how it works.
```

### Multiple video players

```tsx
<div className="flex flex-wrap gap-3">
  <VideoPlayer type="youtube" src="video1" label="Tutorial 1" />
  <VideoPlayer type="youtube" src="video2" label="Tutorial 2" variant="secondary" />
  <VideoPlayer type="youtube" src="video3" label="Tutorial 3" variant="outline" />
</div>
```

### Combining size and variant

```tsx
<!-- Large primary button -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  size="lg"
  variant="primary"
  label="Watch Now"
/>

<!-- Small outline button -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  size="sm"
  variant="outline"
  label="Preview"
/>

<!-- Large icon-only button -->
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  size="lg"
  variant="icon"
/>
```

Watch this video for a quick overview of how Journium works:
This looked well in docs page mdx files.

```tsx
<VideoPlayer 
  type="youtube"
  src="LC69yooyulo"
  title="Demo Video"
  size="sm"
  label=""
  variant="primary"
/>
```

This is the founder video and looked well in blog page:

```tsx
<Video 
    type="youtube"
    src="LC69yooyulo"
     width={560}
     height={315}
     className="mt-6 rounded-xl"
/>
```