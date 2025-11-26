import React from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export interface PopupState {
  isOpen: boolean;
  type: 'success' | 'warning' | 'error';
  message: string;
}

interface PopupProps extends PopupState {
  onClose: () => void;
}

export const Popup: React.FC<PopupProps> = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-bounceIn relative border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 ring-opacity-20 ${isSuccess ? 'bg-green-50 text-green-600 ring-green-500' : 'bg-orange-50 text-orange-600 ring-orange-500'}`}>
             {isSuccess ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          
          <h3 className={`text-lg font-bold mb-2 ${isSuccess ? 'text-navy-900' : 'text-orange-800'}`}>
            {isSuccess ? 'บันทึกสำเร็จ (Success)' : 'แจ้งเตือน (Warning)'}
          </h3>
          
          <p className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>
          
          <Button 
             onClick={onClose} 
             variant={isSuccess ? 'success' : 'primary'}
             className={`w-full justify-center py-2.5 ${!isSuccess && '!bg-orange-500 hover:!bg-orange-600'}`}
          >
            ตกลง (OK)
          </Button>
        </div>
      </div>
    </div>
  );
};