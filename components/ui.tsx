import React, { useRef } from 'react';
import { Camera, Upload, ChevronDown } from 'lucide-react';

// --- BUTTONS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading, 
  ...props 
}) => {
  const baseStyles = "w-full py-3.5 px-6 rounded-xl font-heading font-semibold transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brand-pink text-white shadow-lg shadow-brand-pink/30 hover:bg-rose-600",
    secondary: "bg-brand-blue text-white shadow-lg shadow-brand-blue/30 hover:bg-blue-600",
    outline: "border-2 border-brand-pink text-brand-pink hover:bg-brand-pink/5",
    danger: "bg-red-100 text-red-600 hover:bg-red-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

// --- INPUTS ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        <input 
          className={`w-full bg-white border-2 ${error ? 'border-red-500' : 'border-gray-200 focus:border-brand-blue'} rounded-xl py-3 px-4 outline-none transition-colors text-gray-800 placeholder-gray-400 ${icon ? 'pl-10' : ''}`}
          {...props}
        />
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-medium ml-1">{error}</span>}
    </div>
  );
};

// --- SELECT ---

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: string[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, placeholder = "Selecionar...", className, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        <select
          className={`w-full bg-white border-2 ${error ? 'border-red-500' : 'border-gray-200 focus:border-brand-blue'} rounded-xl py-3 px-4 outline-none transition-colors text-gray-800 appearance-none bg-none`}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <ChevronDown size={18} />
        </div>
      </div>
      {error && <span className="text-xs text-red-500 font-medium ml-1">{error}</span>}
    </div>
  );
};

// --- IMAGE UPLOAD ---

interface ImageUploadProps {
  label: string;
  previewUrl: string | null;
  onImageSelect: (file: File) => void;
  error?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, previewUrl, onImageSelect, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-brand-pink bg-gray-50'}`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={32} />
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 text-brand-pink">
               <Upload size={20} />
            </div>
            <span className="text-sm text-gray-500 font-medium">Carregar foto da galeria</span>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium ml-1">{error}</span>}
    </div>
  );
};

// --- MODAL ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-heading font-bold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- BADGE ---

export const Badge: React.FC<{ children: React.ReactNode, type?: 'verified' | 'premium' }> = ({ children, type = 'verified' }) => {
  const styles = type === 'verified' 
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${styles}`}>
      {type === 'verified' && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
      {children}
    </span>
  );
};