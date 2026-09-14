import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminNav } from '../../components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminGuard>
        <div className="flex min-h-screen">
          <AdminNav />
          <div className="min-w-0 flex-1">
            <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</main>
          </div>
        </div>
      </AdminGuard>
    </div>
  );
}
