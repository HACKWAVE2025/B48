import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "warning" }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
          confirmButton: "bg-red-100 hover:bg-red-200 border-red-300 text-red-700 hover:text-red-800"
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
          confirmButton: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-700 hover:text-yellow-800"
        };
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-blue-500" />,
          confirmButton: "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 hover:text-blue-800"
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="relative w-full max-w-md">
        {/* Modal Content */}
        <div className="relative bg-white border border-[#93DA97]/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-[#E8FFD7] rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-[#557063] hover:text-[#3E5F44]" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {typeStyles.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#3E5F44] mb-3">
              {title}
            </h3>

            {/* Message */}
            <p className="text-[#557063] mb-6 leading-relaxed">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white hover:bg-[#E8FFD7] border border-[#93DA97]/50 rounded-lg text-[#3E5F44] font-medium transition-all duration-300"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-3 border rounded-lg font-medium transition-all duration-300 ${typeStyles.confirmButton}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
