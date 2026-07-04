'use client';

import React, { useState } from 'react';
import { Upload, X, Star, Loader2, Film, ArrowLeft, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MultiMediaUploaderProps {
  label: string;
  folder: 'products' | 'brands' | 'categories' | 'blogs' | 'hero';
  currentValues: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  acceptVideo?: boolean;
  required?: boolean;
}

export default function MultiMediaUploader({
  label,
  folder,
  currentValues = [],
  onChange,
  maxFiles = 8,
  acceptVideo = true,
  required = false,
}: MultiMediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const supabase = createClient();

  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (currentValues.length + fileArray.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} items.`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [...currentValues];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Max size is ${isVideo ? '50MB' : '10MB'}.`);
          continue;
        }

        setUploadProgress(`Uploading ${i + 1}/${fileArray.length}: ${file.name}...`);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      onChange(uploadedUrls);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files);
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

    if (e.dataTransfer.files) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = currentValues.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    const item = currentValues[indexToPrimary];
    const updated = [item, ...currentValues.filter((_, idx) => idx !== indexToPrimary)];
    onChange(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentValues.length) return;
    const updated = [...currentValues];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    onChange(updated);
  };

  return (
    <div className="flex flex-col space-y-3 w-full text-left">
      <div className="flex justify-between items-center">
        <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D]">
          {label} {required && '*'}
        </label>
        <span className="text-[10px] text-[#8C8885]">
          {currentValues.length}/{maxFiles} Uploaded (First item is Primary)
        </span>
      </div>

      {/* Grid of uploaded media */}
      {currentValues.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentValues.map((url, idx) => {
            const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
            const isPrimary = idx === 0;

            return (
              <div
                key={idx}
                className={`relative group border rounded-xl overflow-hidden bg-[#FCFBF9] aspect-square flex items-center justify-center shadow-sm transition-all ${
                  isPrimary ? 'ring-2 ring-[#CA8A04] border-[#CA8A04]' : 'border-[#EFECE6]'
                }`}
              >
                {isVideo ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video src={url} className="w-full h-full object-cover opacity-80" />
                    <Film size={24} className="absolute text-white" />
                  </div>
                ) : (
                  <img src={url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                  {isPrimary && (
                    <span className="bg-[#CA8A04] text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <Star size={10} className="fill-white" /> Primary
                    </span>
                  )}
                  {isVideo && (
                    <span className="bg-black/60 text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                      Video
                    </span>
                  )}
                </div>

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                  <div className="flex justify-between items-center w-full">
                    {!isPrimary ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="p-1.5 bg-white/20 hover:bg-[#CA8A04] text-white rounded-lg backdrop-blur-sm transition-colors"
                        title="Set as Primary Image"
                      >
                        <Star size={14} />
                      </button>
                    ) : <div />}

                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-colors"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Re-order arrows */}
                  {currentValues.length > 1 && (
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white rounded backdrop-blur-sm"
                        title="Move Left"
                      >
                        <ArrowLeft size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, idx + 1)}
                        disabled={idx === currentValues.length - 1}
                        className="p-1 bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white rounded backdrop-blur-sm"
                        title="Move Right"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dropzone for adding more files */}
      {currentValues.length < maxFiles && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl ${
            currentValues.length > 0 ? 'h-24' : 'h-36'
          } flex flex-col items-center justify-center p-3 transition-all ${
            dragActive
              ? 'border-[#CA8A04] bg-[#CA8A04]/5'
              : 'border-[#EFECE6] bg-[#FCFBF9] hover:border-[#CA8A04]/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2 text-[#4E463F]">
              <Loader2 size={20} className="animate-spin text-[#CA8A04]" />
              <span className="text-xs font-medium">{uploadProgress}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1 text-center">
              <Upload size={20} className="text-[#8A8177]" />
              <span className="text-xs font-semibold text-[#1A1A1A]">
                {currentValues.length > 0 ? 'Click or Drag to add more media' : 'Drag & drop media files here or browse'}
              </span>
              <span className="text-[10px] text-[#8A8177]">
                Images (PNG, JPG, WEBP) {acceptVideo && '& Videos (MP4, WEBM)'}
              </span>
            </div>
          )}
          <input
            type="file"
            accept={`image/*${acceptVideo ? ',video/mp4,video/webm' : ''}`}
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
      )}

      <input type="hidden" name="images" value={JSON.stringify(currentValues)} />
    </div>
  );
}
