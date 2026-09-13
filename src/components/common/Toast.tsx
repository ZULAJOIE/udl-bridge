import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border bg-surface transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'border-forest-200'
              : toast.type === 'error'
              ? 'border-red-200'
              : 'border-sage-300'
          }`}
        >
          <div className="mr-3 mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-forest-600" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sage-700" />}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-charcoal">{toast.title}</h4>
            {toast.description && <p className="text-xs text-charcoal-500 mt-0.5">{toast.description}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-charcoal-400 hover:text-charcoal transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
