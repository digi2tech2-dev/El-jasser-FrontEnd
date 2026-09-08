import React from 'react';
import BrandMark from './BrandMark';
import { cn } from '../ui/Button';
import headerBrandImage from '../../assets/El-Jasser card.PNG';

const HeaderBrand = ({ className, iconClassName, textClassName, imageOnly = false }) => (
  <span dir="ltr" className={cn('inline-flex items-center gap-1.5 rounded-[14px] sm:gap-2.5', className)}>
    {imageOnly ? (
      <>
        <img
          src={headerBrandImage}
          alt="El-Jasser Card"
          className={cn('h-7 w-auto max-w-[3.25rem] shrink-0 object-contain drop-shadow-[0_5px_10px_rgba(224,177,59,0.24)] min-[380px]:h-8 sm:h-9', iconClassName)}
          decoding="async"
        />
        <span className="inline-flex min-w-0 flex-col items-start font-['Orbitron'] leading-none">
          <span className="text-[0.64rem] font-black tracking-[0.03em] text-[#d9a62e] min-[380px]:text-[0.7rem] sm:text-[0.82rem]">El-Jasser</span>
          <span className="mt-0.5 text-[0.31rem] font-bold tracking-[0.22em] text-[#37c9e9] min-[380px]:text-[0.34rem] sm:text-[0.4rem]">CARD</span>
        </span>
      </>
    ) : <>
    <BrandMark
      size="xs"
      compact
      showCaption={false}
      className={cn('scale-[0.72] min-[380px]:scale-[0.78] sm:scale-[0.84]', iconClassName)}
    />
    <span className={cn('min-w-0 text-center leading-none', textClassName)}>
      <span className="ka-brand-title block bg-[linear-gradient(110deg,#fff0a3_0%,#d9a62e_48%,#28c9ec_100%)] bg-clip-text font-['Orbitron'] text-[0.84rem] font-black leading-none tracking-[0.06em] text-transparent min-[380px]:text-[0.98rem] sm:text-[1.3rem]">
        El-Jasser
      </span>
      <span className="mt-0.5 block font-['Orbitron'] text-[0.34rem] font-bold uppercase tracking-[0.34em] text-[#d9a62e] sm:text-[0.46rem]">
        CARD
      </span>
      </span>
    </>}
  </span>
);

export default HeaderBrand;
