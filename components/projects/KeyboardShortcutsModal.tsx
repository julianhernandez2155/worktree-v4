'use client';

import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'Navigation', shortcuts: [
    { keys: ['⌘', 'K'], description: 'Focus search' },
    { keys: ['↑', '↓'], description: 'Navigate projects' },
    { keys: ['Enter'], description: 'Open selected project' },
    { keys: ['Escape'], description: 'Close panel/modal' },
    { keys: ['[', ']'], description: 'Navigate tabs in detail pane' },
  ]},
  { category: 'View Controls', shortcuts: [
    { keys: ['1'], description: 'Switch to list view' },
    { keys: ['2'], description: 'Switch to board view' },
    { keys: ['G'], description: 'Cycle grouping options' },
    { keys: ['M'], description: 'Toggle "My Projects" filter' },
  ]},
  { category: 'Actions', shortcuts: [
    { keys: ['N'], description: 'Create new project' },
    { keys: ['E'], description: 'Edit current project' },
    { keys: ['⌘', 'A'], description: 'Select all (coming soon)' },
    { keys: ['Delete'], description: 'Delete selected (coming soon)' },
  ]},
  { category: 'Status Changes', shortcuts: [
    { keys: ['S', '1'], description: 'Set status to Planning' },
    { keys: ['S', '2'], description: 'Set status to Active' },
    { keys: ['S', '3'], description: 'Set status to On Hold' },
    { keys: ['S', '4'], description: 'Set status to Completed' },
  ]},
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-dark-surface border border-dark-border rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-dark-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neon-green/20 rounded-lg">
                    <Keyboard className="w-5 h-5 text-neon-green" />
                  </div>
                  <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-card rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(80vh-120px)]">
              <div className="grid gap-6">
                {shortcuts.map((category, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">{category.category}</h3>
                    <div className="space-y-2">
                      {category.shortcuts.map((shortcut, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
                          <span className="text-gray-300">{shortcut.description}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, kIdx) => (
                              <kbd
                                key={kIdx}
                                className="px-2 py-1 text-xs font-medium bg-dark-surface border border-dark-border rounded text-gray-300"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-dark-card rounded-lg">
                <p className="text-sm text-gray-400">
                  Press <kbd className="px-2 py-1 text-xs font-medium bg-dark-surface border border-dark-border rounded">?</kbd> anytime to show this help
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}