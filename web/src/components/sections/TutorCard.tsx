'use client';

import { useEffect, useRef, useState } from 'react';

export interface TutorVideo {
  src: string;
  title: string;
  description: string;
}

export interface TutorCardData {
  name: string;
  avatar: string;
  /** Bio text — supports JSX/<br /> markup */
  bio: React.ReactNode;
  video?: TutorVideo;
}

const BUTTON_LABELS = {
  en: { watch: 'Watch Tutor Demo', hide: 'Hide Demo' },
  zh: { watch: '观看导师演示', hide: '隐藏演示' },
} as const;

/**
 * Faculty/tutor card with optional video popup.
 * Replaces the ~250-line jQuery script from sections/faculties_zh.html.
 *
 * Behavior:
 * - Desktop (>1024): hover to show popup with 300ms delay; 1.5s hide delay
 * - Mobile/tablet (<=1024): click button to toggle popup
 * - Only one popup visible at a time (closes others on open)
 */
export function TutorCard({ tutor, locale = 'en' }: { tutor: TutorCardData; locale?: 'en' | 'zh' }) {
  const [active, setActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function isMobileOrTablet() {
    return typeof window !== 'undefined' && window.innerWidth <= 1024;
  }

  function closeAllOtherPopups() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.popup_video').forEach((p) => {
      if (p !== popupRef.current) {
        p.classList.remove('active');
        const v = p.querySelector('video');
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      }
    });
    document.querySelectorAll('.tutors_profile__flex-gap').forEach((c) => {
      if (c !== cardRef.current) {
        (c as HTMLElement).style.zIndex = '';
      }
    });
  }

  function handleButtonClick(e: React.MouseEvent) {
    e.stopPropagation();
    closeAllOtherPopups();
    setActive((prev) => {
      const next = !prev;
      if (next && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      } else if (!next && videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      return next;
    });
  }

  function handleMouseEnter() {
    if (isMobileOrTablet() || !tutor.video) return;
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      closeAllOtherPopups();
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (cardRef.current) cardRef.current.style.zIndex = '9999';
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      setActive(true);
    }, 300);
  }

  function handleMouseLeave() {
    if (isMobileOrTablet() || !tutor.video) return;
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    setTimeout(() => {
      const cardHover = cardRef.current?.matches(':hover');
      const popupHover = popupRef.current?.matches(':hover');
      if (!cardHover && !popupHover) {
        hideTimeoutRef.current = setTimeout(() => {
          if (cardRef.current) cardRef.current.style.zIndex = '';
          setActive(false);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }, 1500);
      }
    }, 10);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="tutors_profile__flex-gap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img src={tutor.avatar} alt={tutor.name} className="tutors_profile__circle" />
      <div>
        <h3 className="tutors_profile__style-1">{tutor.name}</h3>
        <p className="tutors_profile__style-2">{tutor.bio}</p>
        {tutor.video && (
          <button type="button" className="tutor-demo-btn" onClick={handleButtonClick}>
            {active ? BUTTON_LABELS[locale].hide : BUTTON_LABELS[locale].watch}
          </button>
        )}
      </div>
      {tutor.video && (
        <div
          ref={popupRef}
          className={`popup_video section-font-style ${active ? 'active' : ''}`}
        >
          <video ref={videoRef} controls loop>
            <source src={tutor.video.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-title">
            <p>{tutor.video.title}</p>
          </div>
          <div className="video-description">
            <p>{tutor.video.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
