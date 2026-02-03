import React from 'react';

interface CountryFlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
}

const countryFlags: Record<string, string> = {
  '+973': '🇧🇭', // Bahrain
  '+966': '🇸🇦', // Saudi Arabia
  '+971': '🇦🇪', // UAE
  '+965': '🇰🇼', // Kuwait
  '+974': '🇶🇦', // Qatar
  '+968': '🇴🇲', // Oman
};

const countryNames: Record<string, { ar: string; en: string }> = {
  '+973': { ar: 'البحرين', en: 'Bahrain' },
  '+966': { ar: 'السعودية', en: 'Saudi Arabia' },
  '+971': { ar: 'الإمارات', en: 'UAE' },
  '+965': { ar: 'الكويت', en: 'Kuwait' },
  '+974': { ar: 'قطر', en: 'Qatar' },
  '+968': { ar: 'عُمان', en: 'Oman' },
};

export const CountryFlag: React.FC<CountryFlagProps> = ({ 
  countryCode, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <span className={`inline-block ${sizeClasses[size]}`}>
      {countryFlags[countryCode] || '🏳️'}
    </span>
  );
};

export const getCountryName = (countryCode: string, locale: 'ar' | 'en' = 'en'): string => {
  return countryNames[countryCode]?.[locale] || countryCode;
};

export const getCountryFlag = (countryCode: string): string => {
  return countryFlags[countryCode] || '🏳️';
};
