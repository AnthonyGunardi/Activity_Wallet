import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';

describe('useNetworkStatus Hook Tests', () => {
  it('should initialize with current navigator online status', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(typeof result.current.isOnline).toBe('boolean');
    expect(result.current.wasOffline).toBe(false);
  });

  it('should update status when online and offline events fire', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(true);

    act(() => {
      result.current.dismissReconnected();
    });

    expect(result.current.wasOffline).toBe(false);
  });
});
