import Link from 'next/link';
import AdminGuard from './components/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold">TillLess Admin</h1>
            <div className="flex space-x-6">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/retailers"
                className="text-gray-600 hover:text-gray-900"
              >
                Retailers
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    </AdminGuard>
  );
}
