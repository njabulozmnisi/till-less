import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/leaflets"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold mb-2">📄 Manual Leaflets</h2>
          <p className="text-gray-600">
            Manually enter pricing data from physical leaflets
          </p>
        </Link>

        <Link
          href="/admin/ocr-review"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold mb-2">🔍 OCR Review Queue</h2>
          <p className="text-gray-600">
            Review and correct OCR-extracted pricing data
          </p>
        </Link>

        <Link
          href="/admin/scrapers"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold mb-2">🤖 Scraper Monitoring</h2>
          <p className="text-gray-600">
            Monitor scraper health, logs, and trigger manual runs
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold mb-2">🏷️ Product Matching</h2>
          <p className="text-gray-600">
            Review automated product matching and manage catalog
          </p>
        </Link>
      </div>
    </div>
  );
}
