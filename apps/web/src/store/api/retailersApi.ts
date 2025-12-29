import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export interface Retailer {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  isActive: boolean;
  isVisible: boolean;
  logoUrl?: string;
  brandColor?: string;
  websiteUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateRetailerRequest {
  slug: string;
  name: string;
  displayName: string;
  isActive?: boolean;
  isVisible?: boolean;
  logoUrl?: string;
  brandColor?: string;
  websiteUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface UpdateRetailerRequest {
  slug?: string;
  name?: string;
  displayName?: string;
  isActive?: boolean;
  isVisible?: boolean;
  logoUrl?: string;
  brandColor?: string;
  websiteUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export const retailersApi = createApi({
  reducerPath: 'retailersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Retailer'],
  endpoints: (builder) => ({
    getRetailers: builder.query<Retailer[], void>({
      query: () => '/retailers',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Retailer' as const, id })),
              { type: 'Retailer', id: 'LIST' },
            ]
          : [{ type: 'Retailer', id: 'LIST' }],
    }),
    getRetailer: builder.query<Retailer, string>({
      query: (id) => `/retailers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Retailer', id }],
    }),
    createRetailer: builder.mutation<Retailer, CreateRetailerRequest>({
      query: (body) => ({
        url: '/retailers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Retailer', id: 'LIST' }],
    }),
    updateRetailer: builder.mutation<
      Retailer,
      { id: string; data: UpdateRetailerRequest }
    >({
      query: ({ id, data }) => ({
        url: `/retailers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Retailer', id },
        { type: 'Retailer', id: 'LIST' },
      ],
      // Optimistic update for toggle
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          retailersApi.util.updateQueryData('getRetailers', undefined, (draft) => {
            const retailer = draft.find((r) => r.id === id);
            if (retailer) {
              Object.assign(retailer, data);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteRetailer: builder.mutation<Retailer, string>({
      query: (id) => ({
        url: `/retailers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Retailer', id },
        { type: 'Retailer', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetRetailersQuery,
  useGetRetailerQuery,
  useCreateRetailerMutation,
  useUpdateRetailerMutation,
  useDeleteRetailerMutation,
} = retailersApi;
