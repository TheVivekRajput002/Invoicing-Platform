// components/Toast.js
import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const Toast = ({ message, productDetails, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 flex items-start gap-3 max-w-md">
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm mb-1">
            Product Auto-Saved ✅
          </p>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{productDetails.name}</span>
            <div className="flex gap-3 mt-1 text-xs">
              <span className="text-green-600">Rate: ₹{productDetails.rate}</span>
              {productDetails.hsn && <span className="text-blue-600">HSN: {productDetails.hsn}</span>}
              <span className="text-purple-600">GST: {productDetails.gst}%</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2" style={{ zIndex: 99999 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          productDetails={toast.productDetails}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Toast;