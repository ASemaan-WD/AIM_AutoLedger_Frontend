import type { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouterProvider } from 'react-aria-components';

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NonNullable<unknown>;
  }
}

export const RouteProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();

  return <RouterProvider navigate={navigate}>{children}</RouterProvider>;
};
