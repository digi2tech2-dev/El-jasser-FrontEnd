import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from './Button';

const variantStyles = {
  default: 'border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/0.78),rgb(var(--color-elevated-rgb)/0.58))] backdrop-blur-xl',
  glass: 'border-[color:rgb(var(--color-border-rgb)/0.6)] bg-[color:rgb(var(--color-card-rgb)/0.62)] backdrop-blur-xl',
};

const compactVariantStyles = {
  default: 'border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/0.78),rgb(var(--color-elevated-rgb)/0.58))] text-[var(--color-text)] backdrop-blur-xl',
  glass: 'border-[color:rgb(var(--color-border-rgb)/0.6)] bg-[color:rgb(var(--color-card-rgb)/0.62)] text-[var(--color-text)] backdrop-blur-xl',
};

const ThemeToggle = ({ className, compact = false, variant = 'default' }) => {
  const { isDark, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'theme-toggle inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-[var(--shadow-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.52)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
          compactVariantStyles[variant] || compactVariantStyles.default,
          className
        )}
        aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الغامق'}
        title={isDark ? 'الوضع الفاتح' : 'الوضع الغامق'}
      >
        {isDark ? (
          <Sun className="h-4.5 w-4.5 text-[#d9a62e] drop-shadow-[0_0_8px_rgb(217_166_46/0.55)]" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-[#37c9e9] drop-shadow-[0_0_8px_rgb(55_201_233/0.5)]" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'theme-toggle relative inline-flex h-11 w-[82px] items-center rounded-full border px-1.5 shadow-[var(--shadow-subtle)] transition-all duration-300 hover:border-[color:rgb(var(--color-primary-rgb)/0.52)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        variantStyles[variant] || variantStyles.default,
        className
      )}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الغامق'}
      title={isDark ? 'الوضع الفاتح' : 'الوضع الغامق'}
    >
      <span
        className={cn(
          'absolute left-1.5 inset-y-1.5 w-[36px] rounded-full bg-[linear-gradient(135deg,#ffe59a,var(--color-primary)_48%,var(--color-secondary))] shadow-[var(--shadow-gold)] transition-transform duration-300 ease-out',
          isDark ? 'translate-x-[38px]' : 'translate-x-0'
        )}
      />
      <span className="relative z-10 grid w-full grid-cols-2 items-center">
        <span className="flex justify-center">
          <Sun className={cn('h-4 w-4 transition-colors', !isDark ? 'text-[var(--color-button-text)]' : 'text-[var(--color-muted)]')} />
        </span>
        <span className="flex justify-center">
          <Moon className={cn('h-4 w-4 transition-colors', isDark ? 'text-[var(--color-button-text)]' : 'text-[var(--color-muted)]')} />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
