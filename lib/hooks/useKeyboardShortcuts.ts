'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't handle shortcuts when typing in input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    shortcuts.forEach(shortcut => {
      const ctrlOrCmd = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey;
      
      const isMatch = 
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (shortcut.ctrl ? e.ctrlKey : true) &&
        (shortcut.cmd ? e.metaKey : true) &&
        (shortcut.shift ? e.shiftKey : !e.shiftKey) &&
        (shortcut.alt ? e.altKey : !e.altKey) &&
        (shortcut.ctrl || shortcut.cmd ? ctrlOrCmd : true);

      if (isMatch) {
        e.preventDefault();
        shortcut.handler();
      }
    });
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

// Common shortcuts for reuse
export const commonShortcuts = {
  search: { key: 'k', cmd: true, description: 'Quick search' },
  escape: { key: 'Escape', description: 'Close modal/panel' },
  newItem: { key: 'n', description: 'Create new item' },
  delete: { key: 'Delete', description: 'Delete selected' },
  selectAll: { key: 'a', cmd: true, description: 'Select all' },
  save: { key: 's', cmd: true, description: 'Save changes' },
};