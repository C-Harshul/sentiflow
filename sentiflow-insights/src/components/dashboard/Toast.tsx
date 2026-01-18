import { CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-success',
    error: 'bg-destructive',
    info: 'bg-info',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in-right`}>
      <div className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
