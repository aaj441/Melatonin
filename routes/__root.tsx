import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from 'react-hot-toast';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <TRPCReactProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A2C',
            color: '#E5E7EB',
            border: '1px solid #4C1D95',
          },
          success: {
            iconTheme: {
              primary: '#A78BFA',
              secondary: '#1A1A2C',
            },
          },
        }}
      />
      <Outlet />
    </TRPCReactProvider>
  );
}
