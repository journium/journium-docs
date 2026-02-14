'use client';

import { useState, useEffect, useCallback } from 'react';
import { Video } from './video';
import { Play, X } from 'lucide-react';

type VideoPlayerProps = {
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
   * Width for aspect ratio calculation
   * @default 560
   */
  width?: number | string;
  /**
   * Height for aspect ratio calculation
   * @default 315
   */
  height?: number | string;
  /**
   * Title for accessibility
   */
  title?: string;
  /**
   * Button label text
   * @default "Watch Video"
   */
  label?: string;
  /**
   * Additional CSS classes for the button
   */
  className?: string;
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
};

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
};

const iconSizeClasses = {
  sm: 'h-8 w-14 text-sm', // 32px x 56px (~16:9 ratio)
  md: 'h-10 w-[4.5rem] text-base', // 40px x 72px (~16:9 ratio)
  lg: 'h-12 w-[5.4rem] text-lg', // 48px x 86px (~16:9 ratio)
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 active:bg-blue-100 dark:active:bg-blue-900',
  icon: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
};

/**
 * VideoPlayer component that shows a button with a play icon.
 * When clicked, it opens the video in a modal overlay with a blurred background.
 * 
 * @example Basic usage
 * ```tsx
 * <VideoPlayer 
 *   type="youtube"
 *   src="dQw4w9WgXcQ"
 *   title="Demo Video"
 * />
 * ```
 * 
 * @example Different sizes and variants
 * ```tsx
 * <VideoPlayer 
 *   type="youtube"
 *   src="dQw4w9WgXcQ"
 *   size="lg"
 *   variant="primary"
 *   label="Watch Demo"
 * />
 * 
 * <!-- Icon-only button -->
 * <VideoPlayer 
 *   type="youtube"
 *   src="dQw4w9WgXcQ"
 *   variant="icon"
 * />
 * ```
 */
export function VideoPlayer({
  type,
  src,
  width = 560,
  height = 315,
  title = 'Video player',
  label = 'Watch Video',
  className = '',
  size = 'md',
  variant = 'primary',
}: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle escape key to close modal
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Check if button is icon-only
  const isIconOnly = variant === 'icon' || !label || label.trim() === '';
  
  // Use rounded-md for icon-only buttons, rounded-lg for buttons with labels
  const roundedClass = isIconOnly ? 'rounded-[10px]' : 'rounded-lg';

  return (
    <>
      {/* Button Trigger */}
      <button
        type="button"
        onClick={openModal}
        className={`inline-flex items-center justify-center ${isIconOnly ? iconSizeClasses[size] : `gap-2 ${sizeClasses[size]}`} ${variantClasses[variant]} ${roundedClass} font-medium transition-all hover:scale-105 focus:outline-none ${className}`}
        aria-label={`Play ${title}`}
      >
        <Play className={`${iconSizes[size]} fill-current`} />
        {!isIconOnly && <span>{label}</span>}
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Blurred Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          
          {/* Video Container */}
          <div
            className="relative z-10 w-full max-w-5xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-full"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              <Video
                type={type}
                src={src}
                width={width}
                height={height}
                title={title}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
