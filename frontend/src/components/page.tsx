import React, { ReactNode } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

type Panels = {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  bottomPanel: ReactNode;
  topPanel: ReactNode;
};

type Props = {
  children: ReactNode;
  className?: string;
};

export const Panel = ({ children, className }: Props) => {
  return <div className={cn('flex flex-1', className)}>{children}</div>;
};
Panel.displayName = 'Panel';

export const LeftPanel = ({ children, className }: Props) => {
  return (
    <Panel className={cn('flex-1 rounded border p-2', className)}>
      {children}
    </Panel>
  );
};
LeftPanel.displayName = 'LeftPanel';

export const RightPanel = ({ children, className }: Props) => {
  return (
    <Panel className={cn('flex-1 rounded border p-2', className)}>
      {children}
    </Panel>
  );
};
RightPanel.displayName = 'RightPanel';

export const TopPanel = ({ children, className }: Props) => {
  return <Panel className={cn('flex-none', className)}>{children}</Panel>;
};
TopPanel.displayName = 'TopPanel';

export const BottomPanel = ({ children, className }: Props) => {
  return <Panel className={className}>{children}</Panel>;
};
BottomPanel.displayName = 'BottomPanel';

type PageProps = Props & {
  mClassName?: string;
  overflowWrapper?: boolean;
};

export const Page = ({
  children,
  className,
  mClassName,
  overflowWrapper = true,
}: PageProps) => {
  const panels = React.Children.toArray(children).reduce<Panels>(
    (acc, child) => {
      if (!React.isValidElement(child)) {
        return acc;
      }

      const childDisplayName = (child.type as any).displayName; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (childDisplayName === 'LeftPanel') {
        acc.leftPanel = child;
      } else if (childDisplayName === 'RightPanel') {
        acc.rightPanel = child;
      } else if (childDisplayName === 'BottomPanel') {
        acc.bottomPanel = child;
      } else if (childDisplayName === 'TopPanel') {
        acc.topPanel = child;
      }

      return acc;
    },
    {
      leftPanel: null,
      rightPanel: null,
      bottomPanel: null,
      topPanel: null,
    }
  );

  const { leftPanel, rightPanel, bottomPanel, topPanel } = panels;

  return overflowWrapper ? (
    <ScrollArea
      className={cn('relative flex h-screen w-screen px-4', className)}
    >
      {topPanel}
      <div className={cn('flex gap-4', mClassName)}>
        {leftPanel}
        {rightPanel}
      </div>
      {bottomPanel}
    </ScrollArea>
  ) : (
    <div className={cn('flex h-screen w-screen px-4', className)}>
      {topPanel}
      <div className={cn('flex flex-1 gap-4', mClassName)}>
        {leftPanel}
        {rightPanel}
      </div>
      {bottomPanel}
    </div>
  );
};
