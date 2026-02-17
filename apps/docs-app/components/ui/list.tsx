import type { ReactNode } from 'react';

export function List({ children }: { children: ReactNode }) {
  return <div className="fd-list">{children}</div>;
}

export function ListItem({ children }: { children: ReactNode }) {
  return <div className="fd-list-item">{children}</div>;
}