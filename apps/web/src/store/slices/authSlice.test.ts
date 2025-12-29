import { describe, it, expect } from 'vitest';
import authReducer, { setCredentials, logout, updateUser } from './authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  it('should handle setCredentials', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test' };
    const token = 'test-token';

    const state = authReducer(initialState, setCredentials({ user, token }));

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle logout', () => {
    const authenticatedState = {
      user: { id: '1', email: 'test@example.com', name: 'Test' },
      token: 'test-token',
      isAuthenticated: true,
    };

    const state = authReducer(authenticatedState, logout());

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle updateUser', () => {
    const authenticatedState = {
      user: { id: '1', email: 'test@example.com', name: 'Test' },
      token: 'test-token',
      isAuthenticated: true,
    };

    const state = authReducer(authenticatedState, updateUser({ name: 'Updated Name' }));

    expect(state.user?.name).toBe('Updated Name');
    expect(state.user?.email).toBe('test@example.com');
  });
});
