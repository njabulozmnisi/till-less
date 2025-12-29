import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../slices/authSlice';
import type { RootState } from '../store';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env['NEXT_PUBLIC_AUTH_URL'] || 'http://localhost:3001/api/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          // Error handled by component
        }
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          // Error handled by component
        }
      },
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          // Logout locally even if server fails
          dispatch(logout());
        }
      },
    }),
    me: builder.query<{ user: User }, void>({
      query: () => '/me',
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
} = authApi;
