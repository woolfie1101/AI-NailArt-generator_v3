import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

const imageUrls = [
  'https://ygfmjafazvtghusieqwk.supabase.co/storage/v1/object/public/ai-image-get/nail-art1.jpeg',
  'https://ygfmjafazvtghusieqwk.supabase.co/storage/v1/object/public/ai-image-get/nail-art2.jpeg',
  'https://ygfmjafazvtghusieqwk.supabase.co/storage/v1/object/public/ai-image-get/nail-art3.jpeg',
  'https://ygfmjafazvtghusieqwk.supabase.co/storage/v1/object/public/ai-image-get/nail-art4.jpeg',
  'https://ygfmjafazvtghusieqwk.supabase.co/storage/v1/object/public/ai-image-get/nail-art5.jpeg',
];

const InspirationCarousel: React.FC = () => {
  const { t } = useTranslations();
  return (
    <div className="mb-10">
      <h2 className="text-xl font-medium text-center text-gray-800 mb-4">
        {t('inspirationTitle')}
      </h2>
      <div 
        className="w-full overflow-hidden group"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
      >
        <ul className="flex items-center space-x-4 animate-scroll group-hover:[animation-play-state:paused]">
          {[...imageUrls, ...imageUrls].map((url, index) => (
            <li key={`inspiration-${index}`} className="flex-shrink-0">
              <img src={url} alt={`${t('inspirationAlt')} ${index + 1}`} className="h-40 w-auto max-w-none rounded-lg shadow-sm" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InspirationCarousel;