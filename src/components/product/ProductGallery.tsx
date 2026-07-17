'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductGalleryProps {
  images?: string[];
  name: string;
  badge?: string | null;
  fallbackImage: string;
}

export function ProductGallery({ images = [], name, badge, fallbackImage }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayImages = images.length > 0 ? images : [fallbackImage];

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square w-full bg-[#FAFAF9] overflow-hidden group cursor-pointer"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={displayImages[selectedImageIndex] || fallbackImage}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute top-6 left-6 flex flex-col space-y-2 z-10">
          {badge === 'bestseller' && (
            <span className="badge-dark">BESTSELLER</span>
          )}
          {badge === 'sale' && (
            <span className="badge-dark">SALE</span>
          )}
          {badge === 'new' && (
            <span className="badge-gold">NEW</span>
          )}
        </div>

        {/* Left/Right Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-text-main" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-text-main" />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative aspect-square w-full bg-[#FAFAF9] overflow-hidden cursor-pointer hover:opacity-80 transition-all duration-200 ${idx === selectedImageIndex ? 'border-b-2 border-text-main' : 'border-b-2 border-transparent'}`}
            >
              <Image src={img} alt={`${name} view ${idx + 1}`} fill sizes="(max-width: 640px) 25vw, 120px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox
          images={displayImages}
          selectedIndex={selectedImageIndex}
          onClose={() => setLightboxOpen(false)}
          onChangeIndex={setSelectedImageIndex}
          title={name}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  selectedIndex,
  onClose,
  onChangeIndex,
  title
}: {
  images: string[];
  selectedIndex: number;
  onClose: () => void;
  onChangeIndex: (idx: number) => void;
  title: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChangeIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
      if (e.key === 'ArrowRight') onChangeIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onChangeIndex, onClose, selectedIndex]);

  const currentMedia = images[selectedIndex];
  const isVideo = currentMedia?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-white">
        <span className="text-xs uppercase tracking-widest font-semibold opacity-75">{title} ({selectedIndex + 1}/{images.length})</span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X size={20} />
        </button>
      </div>

      {/* Media Display */}
      <div className="relative w-full max-w-4xl h-[75vh] flex items-center justify-center">
        {isVideo ? (
          <video src={currentMedia} controls autoPlay className="max-h-full max-w-full rounded-xl object-contain" />
        ) : (
          <Image
            src={currentMedia}
            alt={title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onChangeIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => onChangeIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-6 flex space-x-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onChangeIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === selectedIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
