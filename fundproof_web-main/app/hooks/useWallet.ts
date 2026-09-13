'use client';

import { useState, useEffect } from 'react';
import {
  isConnected,
  getPublicKey,
  requestAccess,
  signTransaction,
} from '@stellar/freighter-api';

// Add TypeScript declaration for Freighter wallet on window object
declare global {
  interface Window {
    freighter?: unknown;
  }
}

export function useWallet() {
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    try {
      // Check if Freighter is available - Freighter attaches to window.freighter but may need to check differently
      // Also handle case where user is on a unsupported browser or hasn't installed Freighter
      if (typeof window === 'undefined') {
        setError('Cannot connect outside of a browser environment.');
        return;
      }

      // Try to use the Freighter API directly - if it fails, Freighter isn't available
      await requestAccess();
      
      // If we get here, access was granted, get the public key
      const key = await getPublicKey();
      setPublicKey(key);
    } catch (e: unknown) {
      console.error('Freighter connection error:', e);
      // Check if the error is about Freighter not being installed
      const errorMessage = e instanceof Error ? e.message : String(e);
      if (errorMessage.includes('window.freighter is not available') || errorMessage.includes('not installed')) {
        setError('Freighter wallet not detected. Please install Freighter from freighter.app and refresh this page.');
      } else if (errorMessage.includes('User rejected')) {
        setError('You rejected the connection request. Please connect your wallet to continue.');
      } else {
        setError(`Failed to connect: ${errorMessage}. Please ensure Freighter is unlocked.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey('');
  };

  return {
    publicKey,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };
}