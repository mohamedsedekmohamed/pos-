import { useState, useEffect } from 'react';

const STORAGE_KEY_USER_UUID = 'pos_user_uuid';

/**
 * Generates a standard RFC4122 version 4 UUID.
 * Uses crypto.randomUUID() when available, falling back to Math.random.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Synchronously retrieves or generates and persists the user UUID.
 * Safe to call outside React components (e.g. in API service headers).
 */
export function getUserUUID(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USER_UUID);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
    const newId = generateUUID();
    localStorage.setItem(STORAGE_KEY_USER_UUID, newId);
    return newId;
  } catch {
    return 'guest-' + Date.now().toString(36);
  }
}

/**
 * React hook to access and manage the persistent device UUID.
 */
export function useUserUUID() {
  const [uuId, setUuId] = useState<string>(() => getUserUUID());

  useEffect(() => {
    const current = getUserUUID();
    if (current !== uuId) {
      setUuId(current);
    }
  }, [uuId]);

  const refreshUUID = () => {
    const newId = generateUUID();
    try {
      localStorage.setItem(STORAGE_KEY_USER_UUID, newId);
    } catch {
      // Ignore storage errors
    }
    setUuId(newId);
    return newId;
  };

  return {
    uuId,
    refreshUUID,
  };
}
