'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploaderProps {
  label: string;
  folder: 'products' | 'brands' | 'categories' | 'blogs' | 'hero';
  currentValue: string;
  onChange: (url: string) => void;
  required?: boolean;
}

export default function ImageUploader({ label, folder, currentValue, onChange, required = false }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentValue);
  const [dragActive, setDragActive] = useState(false);

  const supabase = createClient();

  const handleUpload = async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onChange(publicUrl);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D]">
        {label} {required && '*'}
      </label>
      
      {preview ? (
        <div className="relative border border-[#EFECE6] rounded-xl overflow-hidden bg-[#FCFBF9] h-40 flex items-center justify-center group shadow-sm">
          <img 
            src={preview} 
            alt="Preview" 
            className="h-full w-full object-contain"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-650 hover:bg-red-700 text-white rounded-full shadow-md transition-colors"
              title="Remove Image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center p-4 transition-all ${
            dragActive 
              ? 'border-[#C9A94E] bg-[#C9A94E08]' 
              : 'border-[#EFECE6] bg-[#FCFBF9] hover:border-[#C9A94E50]'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2 text-[#4E463F]">
              <Loader2 size={24} className="animate-spin text-[#9A7B2F]" />
              <span className="text-xs font-medium">Uploading to storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1 text-center">
              <Upload size={24} className="text-[#8A8177] mb-1" />
              <span className="text-xs font-semibold text-[#1A1A1A]">
                Drag & drop image here or <span className="text-[#9A7B2F] underline cursor-pointer">browse</span>
              </span>
              <span className="text-[10px] text-[#8A8177]">
                Supports PNG, JPG, WEBP (Max 5MB)
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
      )}
      <input type="hidden" value={preview} required={required} />
    </div>
  );
}
