'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from "react";

interface JourniumIconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "default" | "subtle" | "primary";
}

export function JourniumIcon({ className, size = "md", variant = "default" }: JourniumIconProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const sizeClasses = {
    xs: "h-4",
    sm: "h-6",
    md: "h-8", 
    lg: "h-12",
    xl: "h-16",
    "2xl": "h-24"
  };

  const containerSizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
    "2xl": "h-28 w-28"
  };

  const variantStyles = {
    default: "",
    subtle: "rounded",
    primary: ""
  };

  const variantTextStyles = {
    default: "text-neutral-900 dark:text-neutral-50",
    subtle: "text-neutral-800 dark:text-neutral-900",
    primary: "text-white dark:text-primary-900"
  };

  const getGradientStyle = () => {
    if (variant === "subtle") {
      return {
        backgroundImage: isDark 
          ? "linear-gradient(to top right, rgb(250, 250, 250), rgb(212, 212, 212))"
          : "linear-gradient(to top right, rgb(229, 229, 229), rgb(163, 163, 163))",
      };
    }
    if (variant === "primary") {
      return {
        backgroundImage: isDark
          ? "linear-gradient(to top right, rgb(241, 245, 249), rgb(148, 163, 184))"
          : "linear-gradient(to top right, rgb(100, 116, 139), rgb(30, 41, 59))",
      };
    }
    return {};
  };

  const hasBackground = variant !== "default";
  const hasTextColorOverride = className?.includes("text-");

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center",
        hasBackground && containerSizeClasses[size],
        variantStyles[variant],
        !hasTextColorOverride && variantTextStyles[variant],
        className
      )}
      style={hasBackground ? getGradientStyle() : undefined}
    >
      <div className={cn(sizeClasses[size])}>
        <svg height="32" viewBox="100 150 500 500" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
          <g opacity="1">
            <path d="M111.728 514.487L269.685 514.487L269.685 645.454L111.728 645.454L111.728 514.487Z" fill="currentColor" fillRule="nonzero" opacity="1" stroke="none"/>
            <path d="M430.226 156.258L588.183 156.258L588.183 287.224L430.226 287.224L430.226 156.258Z" fill="currentColor" fillRule="nonzero" opacity="1" stroke="none"/>
            <path d="M159.756 574.684L430.134 157.035L540.633 228.011L270.255 645.66L159.756 574.684Z" fill="currentColor" fillRule="nonzero" opacity="1" stroke="none"/>
          </g>
        </svg>
      </div>
    </div>
  );
}
