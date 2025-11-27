import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    error: {
      icon: XCircle,
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    info: {
      icon: Info,
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
  };

  const { icon: Icon, borderColor, iconColor, bgColor } = config[type];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white border-l-4 ${borderColor} rounded-lg shadow-lg p-4 max-w-md animate-slideInRight`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <p className="flex-1 text-gray-900 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
