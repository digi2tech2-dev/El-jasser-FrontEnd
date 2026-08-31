import React from 'react';
import BrandMark from './BrandMark';
import { cn } from '../ui/Button';

const HeaderBrand = ({ className, iconClassName, textClassName }) => (
  <span dir="ltr" className={cn('inline-flex items-center gap-1 rounded-[14px] sm:gap-1.5', className)}>
    <BrandMark
      size="xs"
      compact
      showCaption={false}
      className={cn('-mx-1.5 scale-[0.72] min-[380px]:scale-[0.78] sm:scale-[0.84]', iconClassName)}
    />
    <span className={cn('min-w-0 text-center leading-none', textClassName)}>
      <span className="ka-brand-title block bg-[linear-gradient(110deg,#ffe08a_0%,#f59e0b_45%,#c2410c_100%)] bg-clip-text font-['Orbitron'] text-[0.84rem] font-black leading-none tracking-[0.06em] text-transparent min-[380px]:text-[0.98rem] sm:text-[1.3rem]">
        Dra90n
      </span>
      <span className="mt-0.5 block font-['Orbitron'] text-[0.34rem] font-bold uppercase tracking-[0.34em] text-[#f59e0b] sm:text-[0.46rem]">
        STORE
      </span>
    </span>
  </span>
);

export default HeaderBrand;
