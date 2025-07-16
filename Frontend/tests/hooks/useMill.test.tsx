import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { MillProvider, useMill } from '../../context/MillContext';

describe('useMill Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MillProvider>{children}</MillProvider>
  );

  it('provides initial values', () => {
    const { result } = renderHook(() => useMill(), { wrapper });

    expect(result.current.selectedMill).toBeNull();
    expect(typeof result.current.setSelectedMill).toBe('function');
  });

  it('updates selected mill', () => {
    const { result } = renderHook(() => useMill(), { wrapper });

    const testMill = {
      _id: '1',
      millNumber: 'M001',
      name: 'Test Mill',
      location: {
        city: 'Vancouver',
        province: 'BC',
        latitude: 49.2827,
        longitude: -123.1207
      },
      contact: {},
      createdAt: '2023-01-01'
    };

    act(() => {
      result.current.setSelectedMill(testMill);
    });

    expect(result.current.selectedMill).toEqual(testMill);
  });

  it('clears selected mill', () => {
    const { result } = renderHook(() => useMill(), { wrapper });

    const testMill = {
      _id: '1',
      millNumber: 'M001',
      name: 'Test Mill',
      location: {
        city: 'Vancouver',
        province: 'BC',
        latitude: 49.2827,
        longitude: -123.1207
      },
      contact: {},
      createdAt: '2023-01-01'
    };

    act(() => {
      result.current.setSelectedMill(testMill);
    });

    expect(result.current.selectedMill).toEqual(testMill);

    act(() => {
      result.current.setSelectedMill(null);
    });

    expect(result.current.selectedMill).toBeNull();
  });
});