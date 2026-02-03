'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  display_order: number;
}

export const InteractiveGallery = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      const result = await response.json();

      if (result.success && result.images) {
        // Sort by display_order and take up to 6 images for the grid
        const sortedImages = result.images
          .sort((a: GalleryImage, b: GalleryImage) => a.display_order - b.display_order)
          .slice(0, 6);
        setImages(sortedImages);
      }
    } catch (error) {
      console.error('Error loading gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback images if no database images are available
  const fallbackImages = [
    '/placeholder-hero.jpg',
    '/placeholder-hero.jpg', 
    '/placeholder-hero.jpg',
    '/placeholder-hero.jpg',
    '/placeholder-hero.jpg',
    '/placeholder-hero.jpg',
  ];

  const displayImages = images.length > 0 ? images : fallbackImages.map((src, index) => ({
    id: index,
    title: `Car show gallery image ${index + 1}`,
    image_url: src,
    display_order: index
  }));
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {Array.from({ length: 6 }).map((_, index) => (
          <div 
            key={index} 
            className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto"
      onMouseLeave={() => setHovered(null)}
    >
      {displayImages.map((image) => (
        <motion.div
          key={image.id}
          className="relative h-64 md:h-80 rounded-xl overflow-hidden"
          onMouseEnter={() => setHovered(image.image_url)}
          initial={{ scale: 1 }}
          animate={{ scale: hovered === image.image_url ? 1.05 : (hovered ? 0.95 : 1) }}
          transition={{ duration: 0.3 }}
        >          <motion.img
            src={image.image_url}
            alt={image.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ filter: 'grayscale(100%)' }}
            animate={{ filter: hovered === image.image_url ? 'grayscale(0%)' : (hovered ? 'grayscale(100%)' : 'grayscale(0%)') }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              // Fallback to placeholder if image doesn't exist
              e.currentTarget.src = '/placeholder-hero.jpg';
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};
