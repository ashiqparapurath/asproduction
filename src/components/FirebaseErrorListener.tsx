"use client";
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
export function FirebaseErrorListener() {
  const { toast } = useToast();
  useEffect(() => {
    const handleError = () => toast({ variant: 'destructive', title: 'This change couldn’t be saved', description: 'Check that you’re signed in with the correct account and try again.' });
    errorEmitter.on('permission-error', handleError);
    return () => errorEmitter.off('permission-error', handleError);
  }, [toast]);
  return null;
}
