'use client';
import { useEffect } from 'react';

export default function PrintTrigger() {
  useEffect(() => {
    const id = setTimeout(() => window.print(), 500);
    return () => clearTimeout(id);
  }, []);
  return null;
}
