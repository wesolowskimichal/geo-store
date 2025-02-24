import { ReactNode } from 'react';

export type Props = {
  component: ReactNode;
  condition: boolean;
  fallback?: ReactNode;
};

export const withBool = ({ component, condition, fallback }: Props) => {
  return !condition ? component : fallback;
};
