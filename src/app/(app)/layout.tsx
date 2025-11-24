import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <MainSidebar />
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
            <header className="md:hidden flex items-center p-2 border-b">
                <SidebarTrigger />
                <h1 className="ml-2 font-semibold">Softland Updater</h1>
            </header>
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
