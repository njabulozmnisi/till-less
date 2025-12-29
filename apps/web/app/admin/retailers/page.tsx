'use client';

import { useState } from 'react';
import { useGetRetailersQuery, useUpdateRetailerMutation } from '../../../src/store/api/retailersApi';
import type { Retailer } from '../../../src/store/api/retailersApi';
import RetailerDialog from './components/RetailerDialog';

export default function RetailersPage() {
  const { data: retailers, isLoading, error } = useGetRetailersQuery();
  const [updateRetailer] = useUpdateRetailerMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState<Retailer | null>(null);

  const handleToggleActive = async (retailer: Retailer) => {
    try {
      await updateRetailer({
        id: retailer.id,
        data: { isActive: !retailer.isActive },
      }).unwrap();
    } catch (err) {
      console.error('Failed to toggle retailer status:', err);
    }
  };

  const handleEdit = (retailer: Retailer) => {
    setEditingRetailer(retailer);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRetailer(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRetailer(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading retailers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-600">Error loading retailers</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retailers</h1>
          <p className="mt-2 text-gray-600">Manage retailer configurations and status</p>
        </div>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Retailer
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Logo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Display Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {retailers?.map((retailer) => (
              <tr key={retailer.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  {retailer.logoUrl ? (
                    <div
                      className="h-10 w-10 rounded-full"
                      style={{ backgroundColor: retailer.brandColor || '#gray' }}
                    >
                      <img
                        src={retailer.logoUrl}
                        alt={retailer.name}
                        className="h-10 w-10 rounded-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                  {retailer.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                  {retailer.displayName}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {retailer.websiteUrl ? (
                    <a
                      href={retailer.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visit site
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(retailer)}
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      retailer.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {retailer.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => handleEdit(retailer)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {retailers?.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No retailers found. Click "Add Retailer" to create one.
          </div>
        )}
      </div>

      {isDialogOpen && (
        <RetailerDialog
          retailer={editingRetailer}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
