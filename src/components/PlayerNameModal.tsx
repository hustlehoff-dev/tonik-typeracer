'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(20, 'Name must be at most 20 characters')
  .regex(/^[a-zA-Z0-9 _-]+$/, 'Only letters, numbers, spaces, _ and - allowed');

interface PlayerNameModalProps {
  open: boolean;
  onSubmit: (name: string) => Promise<void>;
}

export function PlayerNameModal({ open, onSubmit }: PlayerNameModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = nameSchema.safeParse(name);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch {
      setError('Failed to join. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        // Prevent closing by clicking outside or pressing Escape
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Join the Race</DialogTitle>
          <DialogDescription>
            Choose a display name to enter the competition. Your stats will be
            saved and loaded automatically on return visits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Input
              placeholder="Your racer name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              aria-label="Player name"
              aria-invalid={!!error}
              aria-describedby={error ? 'name-error' : undefined}
              autoFocus
              maxLength={20}
            />
            {error && (
              <p id="name-error" className="text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Joining…' : 'Start Racing'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
