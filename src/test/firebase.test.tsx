import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as firestore from 'firebase/firestore';
import { AppStateData } from '../types';

// Mock Firebase SDKs to prevent actual connections
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({ id: 'mock-doc' })),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
}));

describe('Firebase Service Wrapper & Fallbacks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('determines fallback local storage save and reads if Firebase is not configured', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    const { saveUserData, getUserData, isFirebaseConfigured, reinitializeFirebaseForTest } =
      await import('../services/firebase');

    reinitializeFirebaseForTest('');

    expect(isFirebaseConfigured).toBe(false);

    const data = {
      totalSavings: 10.0,
      streak: 1,
      calculator: {},
      dailyLogs: {},
      unlockedBadges: {},
    };
    const saved = await saveUserData('local-user', data as unknown as AppStateData);
    expect(saved).toBe(true);

    const loaded = await getUserData('local-user');
    expect(loaded.totalSavings).toBe(10.0);

    const nonExistent = await getUserData('non-existent');
    expect(nonExistent).toBeNull();
  });

  it('saves and reads user data using active Firestore when config is present', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'some-active-key');
    const { saveUserData, getUserData, isFirebaseConfigured, reinitializeFirebaseForTest } =
      await import('../services/firebase');

    reinitializeFirebaseForTest('some-active-key');

    expect(isFirebaseConfigured).toBe(true);

    // Mock successful write
    vi.mocked(firestore.setDoc).mockResolvedValueOnce(undefined);

    const data = {
      totalSavings: 25.0,
      streak: 5,
      calculator: {},
      dailyLogs: {},
      unlockedBadges: {},
    };
    const saved = await saveUserData('cloud-user', data as unknown as AppStateData);
    expect(saved).toBe(true);
    expect(firestore.setDoc).toHaveBeenCalled();

    // Mock successful read
    vi.mocked(firestore.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ totalSavings: 25.0, streak: 5 }),
    } as unknown as firestore.DocumentSnapshot);

    const loaded = await getUserData('cloud-user');
    expect(loaded).not.toBeNull();
    expect(loaded.totalSavings).toBe(25.0);
  });

  it('returns null on firestore read if document does not exist', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'some-active-key');
    const { getUserData, reinitializeFirebaseForTest } = await import('../services/firebase');

    reinitializeFirebaseForTest('some-active-key');

    vi.mocked(firestore.getDoc).mockResolvedValueOnce({
      exists: () => false,
    } as unknown as firestore.DocumentSnapshot);

    const loaded = await getUserData('missing-user');
    expect(loaded).toBeNull();
  });

  it('throws error and handles firestore write failures', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'some-active-key');
    const { saveUserData, reinitializeFirebaseForTest } = await import('../services/firebase');

    reinitializeFirebaseForTest('some-active-key');

    const err = new Error('Permission Denied');
    vi.mocked(firestore.setDoc).mockRejectedValueOnce(err);

    // Suppress console.error in vitest output for expected thrown errors
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const data = {
      totalSavings: 0,
      streak: 0,
      calculator: {},
      dailyLogs: {},
      unlockedBadges: {},
    };

    await expect(saveUserData('denied-user', data as unknown as AppStateData)).rejects.toThrow(
      'Permission Denied'
    );
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('throws error and handles firestore read failures', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'some-active-key');
    const { getUserData, reinitializeFirebaseForTest } = await import('../services/firebase');

    reinitializeFirebaseForTest('some-active-key');

    const err = new Error('Quota Exceeded');
    vi.mocked(firestore.getDoc).mockRejectedValueOnce(err);

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(getUserData('denied-user')).rejects.toThrow('Quota Exceeded');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
