import React, { useEffect, useState } from 'react';
import introVideo from '../../assets/مقدمه.MP4';

const IntroSplash = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

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

  if (!isVisible) return null;

  return (
    <section
      className={`intro-splash${isLeaving ? ' intro-splash--leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="مقدمة الجاسر كارد"
    >
      <video
        className="intro-splash__video"
        src={introVideo}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={closeIntro}
        onError={closeIntro}
      />
      <div className="intro-splash__shade" aria-hidden="true" />
      <button type="button" className="intro-splash__skip" onClick={closeIntro}>
        تخطي المقدمة
      </button>
    </section>
  );
};

export default IntroSplash;
