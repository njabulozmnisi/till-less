import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add auth role check - redirect if not admin
  // const session = await getSession();
  // if (!session || !session.user.roles.includes('ADMIN')) {
  //   redirect('/login');
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold">TillLess Admin</h1>
      </nav>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
