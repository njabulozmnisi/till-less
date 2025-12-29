import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { retailersApi } from './retailersApi';
import type { Retailer } from './retailersApi';

describe('retailersApi', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [retailersApi.reducerPath]: retailersApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(retailersApi.middleware),
    });
  });

  it('should have correct endpoints defined', () => {
    const endpoints = retailersApi.endpoints;

    expect(endpoints.getRetailers).toBeDefined();
    expect(endpoints.getRetailer).toBeDefined();
    expect(endpoints.createRetailer).toBeDefined();
    expect(endpoints.updateRetailer).toBeDefined();
    expect(endpoints.deleteRetailer).toBeDefined();
  });

  it('should generate correct hooks', () => {
    expect(retailersApi.useGetRetailersQuery).toBeDefined();
    expect(retailersApi.useGetRetailerQuery).toBeDefined();
    expect(retailersApi.useCreateRetailerMutation).toBeDefined();
    expect(retailersApi.useUpdateRetailerMutation).toBeDefined();
    expect(retailersApi.useDeleteRetailerMutation).toBeDefined();
  });

  describe('Retailer interface', () => {
    it('should have correct Retailer type structure', () => {
      const mockRetailer: Retailer = {
        id: '1',
        slug: 'test-retailer',
        name: 'Test Retailer',
        displayName: 'Test Display Name',
        isActive: true,
        isVisible: true,
        logoUrl: '/logos/test.svg',
        brandColor: '#000000',
        websiteUrl: 'https://test.com',
        supportEmail: 'support@test.com',
        supportPhone: '+1234567890',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'admin-id',
      };

      expect(mockRetailer).toBeDefined();
      expect(mockRetailer.id).toBe('1');
      expect(mockRetailer.slug).toBe('test-retailer');
    });
  });
});
