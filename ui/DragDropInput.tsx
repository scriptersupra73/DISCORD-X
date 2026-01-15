import React, { useState, useRef } from 'react';
import { Upload, FileWarning, Check } from 'lucide-react';

interface DragDropInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  placeholder: string;
  helperText?: string;
}

export const DragDropInput: React.FC<DragDropInputProps> = ({ 
  label, 
  value, 
  onChange, 
  accept = "image/*,video/*", 
  placeholder,
  helperText 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setError('');
    setSuccess(false);
    
    // Warning only for extremely large files (> 500MB) to prevent immediate browser crash
    if (file.size > 500 * 1024 * 1024) {
      setError('WARNING: EXTREME FILE SIZE DETECTED. SYSTEM INSTABILITY POSSIBLE.');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    };
    reader.onerror = () => {
      setError('READ ERROR: UNABLE TO PROCESS FILE.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-mono text-neutral-500 uppercase block">{label}</label>
      
      <div 
        className={`relative border-2 border-dashed transition-all duration-300 p-4 group overflow-hidden
          ${isDragging 
            ? 'border-white bg-neutral-900' 
            : 'border-neutral-800 bg-black hover:border-neutral-600'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-3 relative z-10">
          {/* URL Input */}
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 focus:border-white outline-none transition-colors text-sm font-sans placeholder-neutral-700 truncate"
            placeholder={placeholder}
          />
          
          {/* Drop Zone Visual */}
          <div className="flex items-center justify-center gap-2 text-neutral-600 text-xs font-mono py-2 cursor-pointer hover:text-white transition-colors" onClick={() => fileInputRef.current?.click()}>
             <Upload size={14} className={isDragging ? 'text-white animate-bounce' : ''} />
             <span>{isDragging ? 'RELEASE TO UPLOAD' : 'DRAG FILE HERE OR CLICK TO BROWSE'}</span>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept={accept}
            onChange={handleFileSelect}
          />
        </div>

        {/* Status Indicators */}
        {success && (
             <div className="absolute top-0 right-0 p-2 text-green-500 animate-pulse">
                <Check size={16} />
             </div>
        )}
        
        {value && !error && !success && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Data present"></div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-mono bg-yellow-900/10 p-2 border border-yellow-900/50">
            <FileWarning size={12} />
            {error}
        </div>
      )}
      
      {helperText && <p className="text-[10px] text-neutral-600 font-mono">{helperText}</p>}
    </div>
  );
};