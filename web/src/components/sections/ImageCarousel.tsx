'use client';

import { useState } from 'react';

/**
 * Reusable image carousel that mirrors the Bootstrap-style markup used
 * throughout the legacy templates. Renders the same `carousel`/`carousel-inner`/
 * `carousel-item active`/`carousel-control-prev|next` classes so the
 * existing CSS styling applies, but uses React state for slide control
 * instead of Bootstrap's data-bs-* attributes.
 */
export function ImageCarousel({
  id,
  images,
  imageClassName = 'connect-to-parents__rounded',
  controlClassName = 'connect-to-parents__absolute',
  containerClassName = 'carousel slide connect-to-parents__relative',
}: {
  id: string;
  images: { src: string; alt?: string }[];
  imageClassName?: string;
  controlClassName?: string;
  containerClassName?: string;
}) {
  const [active, setActive] = useState(0);

  function prev() {
    setActive((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setActive((i) => (i + 1) % images.length);
  }

  return (
    <div className={containerClassName} id={id}>
      <div className="carousel-inner">
        {images.map((img, i) => (
          <div key={img.src} className={`carousel-item${i === active ? ' active' : ''}`}>
            <div className="carousel-media">
              <img src={img.src} alt={img.alt ?? ''} className={imageClassName} />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`carousel-control-prev ${controlClassName}`}
        onClick={prev}
      >
        <span aria-hidden="true" className="carousel-control-prev-icon"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        type="button"
        className={`carousel-control-next ${controlClassName}`}
        onClick={next}
      >
        <span aria-hidden="true" className="carousel-control-next-icon"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
