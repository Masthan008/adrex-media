import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <TopNav />
          <main className="flex-1 p-8 pt-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
