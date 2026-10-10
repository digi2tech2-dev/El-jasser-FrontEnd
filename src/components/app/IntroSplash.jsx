import React, { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import introVideo from '../../assets/مقدمه.MP4';

const IntroSplash = ({ onComplete }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const bootLoader = document.getElementById('app-boot-loader');
    bootLoader?.classList.add('is-hidden');

    return undefined;
  }, []);

  const closeIntro = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    window.setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 320);
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMutedState = !video.muted;
    video.muted = nextMutedState;
    setIsMuted(nextMutedState);
    if (!nextMutedState) video.play().catch(() => undefined);
  };

  const isAuthPage = location.pathname === '/auth'
    || location.pathname === '/login'
    || location.pathname.startsWith('/auth/');

  if (!isVisible || isAuthPage) return null;

  return (
    <section
      className={`intro-splash${isLeaving ? ' intro-splash--leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="مقدمة الجاسر كارد"
    >
      <video
        ref={videoRef}
        className="intro-splash__video"
        src={introVideo}
        autoPlay
        muted={isMuted}
        playsInline
        preload="auto"
        onClick={toggleSound}
        onEnded={closeIntro}
        onError={closeIntro}
      />
      <div className="intro-splash__shade" aria-hidden="true" />
      <button type="button" className="intro-splash__sound" onClick={toggleSound}>
        <Volume2 aria-hidden="true" />
        {isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
      </button>
      <button type="button" className="intro-splash__skip" onClick={closeIntro}>
        تخطي المقدمة
      </button>
    </section>
  );
};

export default IntroSplash;
