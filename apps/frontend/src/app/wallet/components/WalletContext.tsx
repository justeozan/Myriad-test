'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface StoredDID {
  did: string;
  publicKey: string;
  privateKey: string;
}

interface StoredCredential {
  id: string;
  credential: Record<string, unknown>;
  storedAt: string;
}

interface WalletState {
  did: StoredDID | null;
  credentials: StoredCredential[];
  setDID: (did: StoredDID) => void;
  addCredential: (credential: Record<string, unknown>) => void;
  removeCredential: (id: string) => void;
  clearWallet: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [did, setDIDState] = useState<StoredDID | null>(null);
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);

  useEffect(() => {
    const storedDID = localStorage.getItem('myriad:did');
    const storedCreds = localStorage.getItem('myriad:credentials');
    if (storedDID) setDIDState(JSON.parse(storedDID) as StoredDID);
    if (storedCreds) setCredentials(JSON.parse(storedCreds) as StoredCredential[]);
  }, []);

  const setDID = (newDID: StoredDID) => {
    setDIDState(newDID);
    localStorage.setItem('myriad:did', JSON.stringify(newDID));
  };

  const addCredential = (credential: Record<string, unknown>) => {
    const entry: StoredCredential = {
      id: crypto.randomUUID(),
      credential,
      storedAt: new Date().toISOString(),
    };
    const updated = [...credentials, entry];
    setCredentials(updated);
    localStorage.setItem('myriad:credentials', JSON.stringify(updated));
  };

  const removeCredential = (id: string) => {
    const updated = credentials.filter((c) => c.id !== id);
    setCredentials(updated);
    localStorage.setItem('myriad:credentials', JSON.stringify(updated));
  };

  const clearWallet = () => {
    setDIDState(null);
    setCredentials([]);
    localStorage.removeItem('myriad:did');
    localStorage.removeItem('myriad:credentials');
  };

  return (
    <WalletContext.Provider value={{ did, credentials, setDID, addCredential, removeCredential, clearWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
