'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewBonsai() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page and show a message about the new way to add bonsais
    toast.info('Use the + button to add a new bonsai by uploading an image');
    router.push('/');
  }, [router]);

  // This page will not be displayed as we redirect immediately
  return null;
}

