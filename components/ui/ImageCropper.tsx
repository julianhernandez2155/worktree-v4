'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import { 
  X, 
  Check, 
  ZoomIn, 
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropper({ 
  image, 
  onCropComplete, 
  onCancel,
  aspectRatio = 1,
  cropShape = 'rect'
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback((_: CroppedArea, croppedAreaPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!croppedAreaPixels) return null;

    try {
      const imageElement = await createImage(image);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return null;

      const maxSize = 800; // Max dimension for the output image
      const scale = Math.min(maxSize / croppedAreaPixels.width, maxSize / croppedAreaPixels.height, 1);
      
      canvas.width = croppedAreaPixels.width * scale;
      canvas.height = croppedAreaPixels.height * scale;

      ctx.drawImage(
        imageElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    } catch (e) {
      console.error('Error creating cropped image:', e);
      return null;
    }
  };

  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
    >
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Crop Image</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cropper */}
      <div className="flex-1 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          cropShape={cropShape}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaChange}
          classes={{
            containerClassName: 'h-full',
            cropAreaClassName: 'border-2 border-neon-green shadow-[0_0_20px_rgba(0,255,127,0.3)]'
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-dark-card border-t border-dark-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Zoom Control */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <ZoomOut className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-neon-green 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:hover:w-5 [&::-webkit-slider-thumb]:hover:h-5 
                         [&::-webkit-slider-thumb]:transition-all"
              />
              <ZoomIn className="w-5 h-5 text-gray-400" />
              <button
                onClick={() => {
                  setZoom(1);
                  setCrop({ x: 0, y: 0 });
                }}
                className="ml-2 p-2 text-gray-400 hover:text-white hover:bg-dark-surface 
                         rounded-lg transition-colors"
                title="Reset zoom and position"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-neon-green text-black 
                         font-medium rounded-lg hover:bg-neon-green/90 transition-colors"
              >
                <Check className="w-4 h-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}