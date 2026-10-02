import React, { useState } from 'react';

interface EditorialImageProps {
  src: string;
  hoverSrc?: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
  colourHex?: string;
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  hoverSrc,
  alt,
  className = '',
  aspectClassName = 'aspect-[3/4]',
  colourHex = '#EAE5DC',
}) => {
  const [primaryError, setPrimaryError] = useState(false);
  const [hoverError, setHoverError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#ECE8E0] ${aspectClassName} group select-none`}
    >
      {!primaryError ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setPrimaryError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0 scale-95'
          } ${
            hoverSrc && !hoverError
              ? 'group-hover:opacity-0 group-hover:scale-105'
              : 'group-hover:scale-105'
          } ${className}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col justify-between p-6 bg-[#EAE5DC] text-[#161514]">
          <div className="text-[10px] font-mono-num tracking-[0.2em] uppercase text-[#5A4638]">
            AYÉ STUDIO · ARCHIVE PLATE
          </div>
          <div className="my-auto flex items-center justify-center">
            <div
              className="w-24 h-32 border border-[#161514]/20 shadow-sm"
              style={{ backgroundColor: colourHex }}
            />
          </div>
          <div className="text-sm font-editorial tracking-wide text-[#161514]">
            {alt}
          </div>
        </div>
      )}

      {hoverSrc && !hoverError && !primaryError && (
        <img
          src={hoverSrc}
          alt={`${alt} — alternate studio view`}
          referrerPolicy="no-referrer"
          onError={() => setHoverError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
        />
      )}
    </div>
  );
};
