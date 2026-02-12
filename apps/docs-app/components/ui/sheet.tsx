'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '../../lib/cn';

const SheetContext = React.createContext<{
  side?: 'top' | 'right' | 'bottom' | 'left';
}>({});

function Sheet({ 
  children,
  ...props 
}: React.ComponentProps<typeof SheetPrimitive.Root> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const side = props.side || 'right';
  const isDrawer = side === 'bottom' || side === 'top';

  if (isDrawer) {
    return (
      <SheetContext.Provider value={{ side }}>
        <DrawerPrimitive.Root 
          {...props}
          direction={side === 'bottom' ? 'bottom' : 'top'}
        >
          {children}
        </DrawerPrimitive.Root>
      </SheetContext.Provider>
    );
  }

  return (
    <SheetContext.Provider value={{ side }}>
      <SheetPrimitive.Root {...props}>
        {children}
      </SheetPrimitive.Root>
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  const { side } = React.useContext(SheetContext);
  const isDrawer = side === 'bottom' || side === 'top';

  if (isDrawer) {
    return <DrawerPrimitive.Trigger {...props} />;
  }

  return <SheetPrimitive.Trigger {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  const { side } = React.useContext(SheetContext);
  const isDrawer = side === 'bottom' || side === 'top';

  if (isDrawer) {
    return <DrawerPrimitive.Close {...props} />;
  }

  return <SheetPrimitive.Close {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const { side } = React.useContext(SheetContext);
  const isDrawer = side === 'bottom' || side === 'top';

  if (isDrawer) {
    return <DrawerPrimitive.Portal {...props} />;
  }

  return <SheetPrimitive.Portal {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  const { side } = React.useContext(SheetContext);
  const isDrawer = side === 'bottom' || side === 'top';

  if (isDrawer) {
    return (
      <DrawerPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-fd-overlay backdrop-blur-xs',
          className
        )}
        {...props}
      />
    );
  }

  return (
    <SheetPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-fd-overlay backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out',
        className
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  showHandle = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
  showHandle?: boolean;
}) {
  const isDrawer = side === 'bottom' || side === 'top';
  const shouldShowHandle = showHandle && isDrawer;

  if (isDrawer) {
    return (
      <SheetPortal>
        <SheetOverlay />
        <DrawerPrimitive.Content
          className={cn(
            'fixed z-50 flex flex-col bg-fd-popover text-fd-popover-foreground focus-visible:outline-none',
            side === 'top' &&
              'inset-x-0 top-0 mb-24 max-h-[90dvh] rounded-b-2xl',
            side === 'bottom' &&
              'inset-x-0 bottom-0 mt-24 max-h-[90dvh] rounded-t-2xl',
            className
          )}
          {...props}
        >
          {shouldShowHandle && (
            <div className="mx-auto mt-4 mb-2 h-1.5 w-12 rounded-full bg-fd-muted" />
          )}
          {children}
        </DrawerPrimitive.Content>
      </SheetPortal>
    );
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col bg-fd-popover text-fd-popover-foreground shadow-xl transition ease-in-out focus-visible:outline-none data-[state=closed]:duration-300 data-[state=open]:duration-500',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
          className
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-auto flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  const { side } = React.useContext(SheetContext);
  const isDrawer = side === 'bottom' || side === 'top';

  if (isDrawer) {
    return (
      <DrawerPrimitive.Title
        className={cn('text-base font-semibold', className)}
        {...props}
      />
    );
  }

  return (
    <SheetPrimitive.Title
      className={cn('text-base font-semibold', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  const { side } = React.useContext(SheetContext);
  const isDrawer = side === 'bottom' || side === 'top';

  if (isDrawer) {
    return (
      <DrawerPrimitive.Description
        className={cn('text-xs text-fd-muted-foreground', className)}
        {...props}
      />
    );
  }

  return (
    <SheetPrimitive.Description
      className={cn('text-xs text-fd-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
