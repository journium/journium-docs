type VideoSource = {
  src: string;
  type?: string;
};

type VideoTrack = {
  src: string;
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  srcLang?: string;
  label?: string;
};

type SelfHostedVideoProps = {
  /**
   * Type of video: 'self-hosted' for direct video files
   */
  type?: 'self-hosted';
  /**
   * Video source(s). Can be a string or array of sources for multiple formats
   */
  src: string | VideoSource[];
  /**
   * Width of the video player
   */
  width?: number | string;
  /**
   * Height of the video player
   */
  height?: number | string;
  /**
   * Display default playback controls
   */
  controls?: boolean;
  /**
   * Automatically start playing (Note: browsers may require muted=true)
   */
  autoPlay?: boolean;
  /**
   * Loop the video playback
   */
  loop?: boolean;
  /**
   * Mute the audio by default
   */
  muted?: boolean;
  /**
   * How the video should be preloaded: 'none', 'metadata', or 'auto'
   */
  preload?: 'none' | 'metadata' | 'auto';
  /**
   * Enable inline playback on iOS devices
   */
  playsInline?: boolean;
  /**
   * Poster image to show before video plays
   */
  poster?: string;
  /**
   * Subtitle/caption tracks
   */
  tracks?: VideoTrack[];
  /**
   * Accessible label for the video
   */
  'aria-label'?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
};

type ExternalVideoProps = {
  /**
   * Type of video: 'youtube', 'vimeo', or 'iframe' for custom external embeds
   */
  type: 'youtube' | 'vimeo' | 'iframe';
  /**
   * For YouTube: video ID or full URL
   * For Vimeo: video ID or full URL
   * For iframe: full embed URL
   */
  src: string;
  /**
   * Width of the iframe
   */
  width?: number | string;
  /**
   * Height of the iframe
   */
  height?: number | string;
  /**
   * Allow fullscreen mode
   */
  allowFullScreen?: boolean;
  /**
   * Title for accessibility
   */
  title?: string;
  /**
   * Enable lazy loading
   */
  loading?: 'eager' | 'lazy';
  /**
   * Additional CSS classes
   */
  className?: string;
};

type VideoProps = SelfHostedVideoProps | ExternalVideoProps;

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeId(url: string): string {
  // Handle already clean IDs
  if (!url.includes('/') && !url.includes('?')) {
    return url;
  }
  
  // Handle youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle youtube.com/embed/ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];
  
  return url;
}

/**
 * Extract Vimeo video ID from various URL formats
 */
function getVimeoId(url: string): string {
  // Handle already clean IDs
  if (!url.includes('/')) {
    return url;
  }
  
  // Handle vimeo.com/ID
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return match[1];
  
  return url;
}

/**
 * Video component that supports both self-hosted and externally embedded videos
 * 
 * @example Self-hosted video
 * ```tsx
 * <Video 
 *   src="/videos/demo.mp4"
 *   width={640}
 *   height={360}
 *   controls
 *   preload="none"
 * />
 * ```
 * 
 * @example Multiple sources for compatibility
 * ```tsx
 * <Video 
 *   src={[
 *     { src: "/videos/demo.mp4", type: "video/mp4" },
 *     { src: "/videos/demo.webm", type: "video/webm" }
 *   ]}
 *   controls
 * />
 * ```
 * 
 * @example With subtitles
 * ```tsx
 * <Video 
 *   src="/videos/demo.mp4"
 *   tracks={[
 *     { src: "/captions/en.vtt", kind: "subtitles", srcLang: "en", label: "English" }
 *   ]}
 *   controls
 * />
 * ```
 * 
 * @example YouTube video
 * ```tsx
 * <Video 
 *   type="youtube"
 *   src="dQw4w9WgXcQ"
 *   width={560}
 *   height={315}
 * />
 * ```
 * 
 * @example Vimeo video
 * ```tsx
 * <Video 
 *   type="vimeo"
 *   src="123456789"
 *   width={640}
 *   height={360}
 * />
 * ```
 */
export function Video(props: VideoProps) {
  // Handle external video embeds
  if ('type' in props && props.type !== 'self-hosted') {
    const externalProps = props as ExternalVideoProps;
    const {
      type,
      src,
      width = 560,
      height = 315,
      allowFullScreen = true,
      title = 'Video player',
      loading = 'lazy',
      className,
    } = externalProps;

    let embedUrl = '';

    switch (type) {
      case 'youtube':
        const youtubeId = getYouTubeId(src);
        embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
        break;
      case 'vimeo':
        const vimeoId = getVimeoId(src);
        embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
        break;
      case 'iframe':
        embedUrl = src;
        break;
    }

    return (
      <iframe
        src={embedUrl}
        width={width}
        height={height}
        allowFullScreen={allowFullScreen}
        title={title}
        loading={loading}
        className={className}
        style={{ border: 0 }}
      />
    );
  }

  // Handle self-hosted videos
  const selfHostedProps = props as SelfHostedVideoProps;
  const {
    src,
    width = 640,
    height = 360,
    controls = true,
    autoPlay = false,
    loop = false,
    muted = false,
    preload = 'metadata',
    playsInline = false,
    poster,
    tracks,
    'aria-label': ariaLabel = 'Video player',
    className,
  } = selfHostedProps;

  // Normalize src to array format
  const sources: VideoSource[] = Array.isArray(src)
    ? src
    : [{ src, type: src.endsWith('.webm') ? 'video/webm' : 'video/mp4' }];

  return (
    <video
      width={width}
      height={height}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      preload={preload}
      playsInline={playsInline}
      poster={poster}
      aria-label={ariaLabel}
      className={className}
    >
      {sources.map((source, index) => (
        <source key={index} src={source.src} type={source.type} />
      ))}
      
      {tracks?.map((track, index) => (
        <track
          key={index}
          src={track.src}
          kind={track.kind || 'subtitles'}
          srcLang={track.srcLang}
          label={track.label}
        />
      ))}
      
      Your browser does not support the video tag.
    </video>
  );
}