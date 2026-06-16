import { AppSidebar } from '@/components/app-sidebar';
import Navbar from '@/components/navbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Loading from '@/components/base/loading';

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw redirect({ to: '/login' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: user,
    isLoading: isLoadingUser,
  } = useCurrentUser();

  if (isLoadingUser) {
    return (
      <div className="flex h-svw w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-svw w-full overflow-hidden">
        <div className="max-w-full">
          <AppSidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
