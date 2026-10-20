import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function NotificationToast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="var(--accent-green)" />,
    error: <AlertCircle size={18} color="var(--accent-rose)" />,
    warning: <Info size={18} color="var(--accent-amber)" />,
  };

  return (
    <div className="toast-container">
      <div className={`toast-item toast-${toast.type || 'info'}`}>
        {icons[toast.type] || icons.success}
        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{toast.message}</span>
      </div>
    </div>
  );
}
