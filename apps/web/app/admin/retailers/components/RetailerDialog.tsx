'use client';

import { useState, useEffect } from 'react';
import {
  useCreateRetailerMutation,
  useUpdateRetailerMutation,
  type Retailer,
  type CreateRetailerRequest,
} from '../../../../src/store/api/retailersApi';

interface RetailerDialogProps {
  retailer: Retailer | null;
  onClose: () => void;
}

export default function RetailerDialog({ retailer, onClose }: RetailerDialogProps) {
  const [createRetailer, { isLoading: isCreating }] = useCreateRetailerMutation();
  const [updateRetailer, { isLoading: isUpdating }] = useUpdateRetailerMutation();

  const [formData, setFormData] = useState<CreateRetailerRequest>({
    slug: '',
    name: '',
    displayName: '',
    isActive: true,
    isVisible: true,
    logoUrl: '',
    brandColor: '',
    websiteUrl: '',
    supportEmail: '',
    supportPhone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (retailer) {
      setFormData({
        slug: retailer.slug,
        name: retailer.name,
        displayName: retailer.displayName,
        isActive: retailer.isActive,
        isVisible: retailer.isVisible,
        logoUrl: retailer.logoUrl || '',
        brandColor: retailer.brandColor || '',
        websiteUrl: retailer.websiteUrl || '',
        supportEmail: retailer.supportEmail || '',
        supportPhone: retailer.supportPhone || '',
      });
    }
  }, [retailer]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (formData.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supportEmail)) {
      newErrors.supportEmail = 'Invalid email format';
    }
    if (formData.websiteUrl && !/^https?:\/\/.+/.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Invalid URL format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (retailer) {
        await updateRetailer({
          id: retailer.id,
          data: formData,
        }).unwrap();
      } else {
        await createRetailer(formData).unwrap();
      }
      onClose();
    } catch (err: any) {
      setErrors({ submit: err?.data?.message || 'Failed to save retailer' });
    }
  };

  const handleChange = (field: keyof CreateRetailerRequest, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {retailer ? 'Edit Retailer' : 'Add Retailer'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
                placeholder="checkers"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
                placeholder="Checkers"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className={`w-full rounded-md border px-3 py-2 ${
                errors.displayName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              placeholder="Checkers Sixty60"
            />
            {errors.displayName && <p className="mt-1 text-sm text-red-500">{errors.displayName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                disabled={isLoading}
                placeholder="/logos/checkers.svg"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Brand Color</label>
              <input
                type="text"
                value={formData.brandColor}
                onChange={(e) => handleChange('brandColor', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                disabled={isLoading}
                placeholder="#00A859"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Website URL</label>
            <input
              type="text"
              value={formData.websiteUrl}
              onChange={(e) => handleChange('websiteUrl', e.target.value)}
              className={`w-full rounded-md border px-3 py-2 ${
                errors.websiteUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              placeholder="https://www.checkers.co.za"
            />
            {errors.websiteUrl && <p className="mt-1 text-sm text-red-500">{errors.websiteUrl}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Support Email</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 ${
                  errors.supportEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
                placeholder="support@checkers.co.za"
              />
              {errors.supportEmail && <p className="mt-1 text-sm text-red-500">{errors.supportEmail}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Support Phone</label>
              <input
                type="tel"
                value={formData.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                disabled={isLoading}
                placeholder="+27 11 123 4567"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="mr-2"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => handleChange('isVisible', e.target.checked)}
                className="mr-2"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700">Visible</span>
            </label>
          </div>

          {errors.submit && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : retailer ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
