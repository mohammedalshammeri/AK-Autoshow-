import React from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors, UseFormWatch } from 'react-hook-form';

// Gulf countries data with phone codes and flags
export const gulfCountries = [
  { 
    code: '+973', 
    country: 'البحرين', 
    countryEn: 'Bahrain', 
    flag: '🇧🇭',
    minLength: 8,
    maxLength: 8,
    example: '12345678'
  },
  { 
    code: '+966', 
    country: 'السعودية', 
    countryEn: 'Saudi Arabia', 
    flag: '🇸🇦',
    minLength: 9,
    maxLength: 9,
    example: '512345678'
  },
  { 
    code: '+971', 
    country: 'الإمارات', 
    countryEn: 'UAE', 
    flag: '🇦🇪',
    minLength: 9,
    maxLength: 9,
    example: '501234567'
  },
  { 
    code: '+965', 
    country: 'الكويت', 
    countryEn: 'Kuwait', 
    flag: '🇰🇼',
    minLength: 8,
    maxLength: 8,
    example: '12345678'
  },
  { 
    code: '+974', 
    country: 'قطر', 
    countryEn: 'Qatar', 
    flag: '🇶🇦',
    minLength: 8,
    maxLength: 8,
    example: '12345678'
  },
  { 
    code: '+968', 
    country: 'عُمان', 
    countryEn: 'Oman', 
    flag: '🇴🇲',
    minLength: 8,
    maxLength: 8,
    example: '12345678'
  }
];

interface PhoneInputProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  selectedCountryCode: string;
  setSelectedCountryCode: (code: string) => void;
  locale: string;
  translations: {
    phoneNumber: string;
    phoneNumberPlaceholder: string;
  };
}
export const PhoneInput: React.FC<PhoneInputProps> = ({
  register,
  setValue,
  watch,
  errors,
  selectedCountryCode,
  setSelectedCountryCode,
  locale,
  translations
}) => {
  const selectedCountry = gulfCountries.find(c => c.code === selectedCountryCode);
  const hasPhoneError = errors.phoneNumber || errors.countryCode;
  const phoneNumberValue = watch('phoneNumber') || '';
  const isValidPhone = selectedCountry && validatePhoneNumber(
    phoneNumberValue, 
    selectedCountryCode
  );

  return (
    <div className={`phone-input-container ${hasPhoneError ? 'phone-input-invalid' : isValidPhone ? 'phone-input-valid' : ''}`}>
      <label className="phone-input-label">
        {translations.phoneNumber}
      </label>
      
      <div className="phone-input-wrapper">
        {/* Country Code Selector */}
        <select 
          {...register('countryCode')}
          onChange={(e) => {
            setSelectedCountryCode(e.target.value);
            setValue('countryCode', e.target.value);
          }}
          className="country-code-select"
        >
          {gulfCountries.map(country => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code} {locale === 'ar' ? country.country : country.countryEn}
            </option>
          ))}
        </select>
        
        {/* Phone Number Input */}
        <input 
          {...register('phoneNumber')} 
          type="tel" 
          placeholder={translations.phoneNumberPlaceholder}
          className="phone-number-input"
          maxLength={selectedCountry?.maxLength || 9}
          onInput={(e) => {
            // Only allow numbers
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/\D/g, '');
          }}
        />
      </div>
      
      {/* Error Messages */}
      {errors.countryCode && (
        <p className="phone-error-message">{String(errors.countryCode.message || '')}</p>
      )}
      {errors.phoneNumber && (
        <p className="phone-error-message">{String(errors.phoneNumber.message || '')}</p>
      )}
      
      {/* Phone Number Format Hint */}
      {selectedCountry && !hasPhoneError && (
        <div className="phone-example-hint">
          <span>{locale === 'ar' ? 'مثال:' : 'Example:'}</span>
          <code className="phone-example-code">
            {selectedCountry.code} {selectedCountry.example}
          </code>
          <span className="phone-digits-hint">
            ({selectedCountry.minLength} {locale === 'ar' ? 'أرقام' : 'digits'})
          </span>
        </div>
      )}
    </div>
  );
};

// Phone validation function
export const validatePhoneNumber = (phoneNumber: string, countryCode: string): boolean => {
  const country = gulfCountries.find(c => c.code === countryCode);
  if (!country) return false;
  
  // Remove any non-digit characters
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Check if length matches the country requirements
  return cleanPhone.length >= country.minLength && cleanPhone.length <= country.maxLength;
};
