# Mobile Keyboard Positioning Fix

## Problem
On real mobile devices (especially iOS and some Android devices), when the virtual keyboard appears, the textarea input in the AI Search bottom sheet gets hidden behind the keyboard. This issue doesn't appear in Chrome DevTools device emulation but manifests on actual devices.

## Root Cause
Mobile browsers handle viewport and keyboard interactions differently:
- **iOS Safari**: Fixed and bottom-positioned elements don't automatically adjust when the virtual keyboard appears
- **Android/Chrome**: Default behavior changed in Chrome 108 (November 2022) to match iOS behavior
- **Desktop Emulation**: Doesn't accurately simulate real device keyboard behavior

## Solutions Implemented

### 1. Viewport Meta Tag with `interactive-widget` ✅
**File**: `apps/docs-app/app/layout.tsx`

Added viewport configuration as a separate export (following Next.js App Router best practices) that makes the viewport resize when keyboard appears on Android/Chrome:

```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content', // Key property
};
```

**Important**: Next.js requires viewport configuration to be exported separately from metadata using the `Viewport` type. Putting it inside the `metadata` object will trigger deprecation warnings.

**Browser Support**:
- ✅ Chrome/Chromium on Android (Chrome 108+)
- ⏳ iOS/Safari (not yet implemented, WebKit bug #259770)

**References**:
- [Next.js: generateViewport API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)
- [HTMHell: Control Viewport Resize Behavior](https://www.htmhell.dev/adventcalendar/2024/4/)
- [Chrome Blog: Viewport Resize Behavior Changes](https://developer.chrome.com/blog/viewport-resize-behavior)

### 2. Dynamic Viewport Units (`dvh`) ✅
**File**: `apps/docs-app/components/ui/sheet.tsx`

Changed from static `max-h-[90dvh]` to using `dvh` units correctly by removing max-height constraint on bottom sheets, allowing them to adapt to keyboard:

```tsx
// Before: max-h-[90dvh] on bottom sheets (prevented proper resizing)
// After: Removed max-h constraint, letting content adapt naturally
```

**Why `dvh` works**:
- `dvh` (dynamic viewport height) automatically accounts for browser UI and keyboard
- Unlike `vh` (viewport height) which is static and doesn't change with keyboard
- Modern browsers (2023+) all support `dvh`

**References**:
- [Francisco Moretti: Fix Mobile Keyboard Overlap with dvh](https://www.franciscomoretti.com/blog/fix-mobile-keyboard-overlap-with-visualviewport)

### 3. Visual Viewport API Listener ✅
**File**: `apps/docs-app/components/ai/ai-search.tsx`

Implemented JavaScript listener for iOS devices that dynamically adjusts sheet height based on actual visible viewport:

```typescript
useEffect(() => {
  if (!isMobile || !open) return;

  const handleViewportResize = () => {
    if (window.visualViewport) {
      // Double requestAnimationFrame for iOS timing issues
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setViewportHeight(window.visualViewport!.height);
        });
      });
    }
  };

  if (window.visualViewport) {
    handleViewportResize();
    window.visualViewport.addEventListener('resize', handleViewportResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }
}, [isMobile, open]);
```

**Key Details**:
- Uses `window.visualViewport` API to get actual visible area
- Double `requestAnimationFrame` workaround for iOS timing bug (WebKit #237851)
- Dynamically sets inline styles when viewport height is available
- Falls back to `dvh` units when API not available

**Browser Support**:
- ✅ iOS Safari 13+
- ✅ Chrome/Android 61+
- ✅ Firefox 91+

**References**:
- [MDN: Visual Viewport API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
- [Saricden: Fixed Elements on iOS](https://saricden.com/how-to-make-fixed-elements-respect-the-virtual-keyboard-on-ios)

## How It Works

### On Android/Chrome (with `interactive-widget` support):
1. `interactiveWidget: 'resizes-content'` makes the Layout Viewport resize
2. Sheet naturally adapts to new viewport size
3. Visual Viewport API provides additional refinement

### On iOS/Safari:
1. `interactive-widget` not supported, ignored gracefully
2. Visual Viewport API detects keyboard appearance via `resize` event
3. JavaScript calculates actual visible height
4. Inline styles override CSS to position sheet correctly
5. Falls back to `dvh` units if API unavailable

### Fallback Chain:
```
Visual Viewport API (JS) 
  → dvh units (CSS) 
    → 85vh (static fallback)
```

## Testing

### Desktop Chrome DevTools
1. Open DevTools
2. Enable device toolbar (Cmd/Ctrl + Shift + M)
3. Select iPhone/Android device
4. Test AI Search sheet

**Note**: DevTools doesn't perfectly simulate keyboard behavior. Real device testing required.

### Real Device Testing (Required)
1. Deploy to preview environment
2. Test on actual iOS device (iPhone)
3. Test on actual Android device
4. Open AI Search sheet
5. Focus on textarea input
6. Verify:
   - Textarea remains visible above keyboard
   - Content scrolls if needed
   - No content hidden behind keyboard

## Browser Compatibility

| Feature | iOS Safari | Chrome Android | Chrome Desktop |
|---------|-----------|----------------|----------------|
| `dvh` units | ✅ 15.4+ | ✅ 108+ | ✅ 108+ |
| Visual Viewport API | ✅ 13+ | ✅ 61+ | ✅ 61+ |
| `interactive-widget` | ⏳ Pending | ✅ 108+ | N/A |

## Known Issues & Workarounds

### iOS `visualViewport.offsetTop` Bug (WebKit #237851)
**Issue**: `offsetTop` sometimes reports 0 when keyboard is open in web app mode.

**Workaround**: Double `requestAnimationFrame` ensures accurate measurements by waiting for layout stabilization.

### Desktop Chrome DevTools Limitation
**Issue**: Keyboard simulation in DevTools doesn't trigger Visual Viewport API events.

**Workaround**: Must test on real devices to verify keyboard behavior.

## Future Improvements

1. **When iOS Implements `interactive-widget`**: Consider removing Visual Viewport API code and relying solely on viewport meta tag
2. **VirtualKeyboard API**: Monitor Chrome's VirtualKeyboard API for programmatic keyboard control (Chrome 94+)
3. **CSS `@supports` Queries**: Add feature detection for `dvh` units

## References

- [HTMHell: interactive-widget Viewport Property](https://www.htmhell.dev/adventcalendar/2024/4/)
- [Chrome: Viewport Resize Behavior Changes](https://developer.chrome.com/blog/viewport-resize-behavior)
- [Francisco Moretti: Fix Mobile Keyboard Overlap](https://www.franciscomoretti.com/blog/fix-mobile-keyboard-overlap-with-visualviewport)
- [MDN: Visual Viewport API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
- [Saricden: Fixed Elements on iOS Keyboard](https://saricden.com/how-to-make-fixed-elements-respect-the-virtual-keyboard-on-ios)
- [WebKit Bug #259770: interactive-widget Implementation](https://bugs.webkit.org/show_bug.cgi?id=259770)
- [WebKit Bug #237851: visualViewport.offsetTop Issue](https://bugs.webkit.org/show_bug.cgi?id=237851)
