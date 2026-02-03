'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { registerAction, getEventsAction } from '@/app/actions';
import { getCarMakes, getCarModels, type CarMake, type CarModel } from '@/lib/carApiService';
import GroupRegistrationForm from './GroupRegistrationForm';

interface Event {
  id: string;
  name: string;
}

// Generate years from current year back to 1980
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1980; year--) {
    years.push(year);
  }
  return years;
};

// Sequential File Uploader Component
const FileUploader = ({ control, name, t, locale, field }: { 
  control: any, 
  name: string, 
  t: any, 
  locale: string, 
  field: any 
}) => {
  const [previews, setPreviews] = useState<(string | null)[]>([null]);

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 8MB - Cloudinary can handle it, but for mobile data safety)
      if (file.size > 8 * 1024 * 1024) {
        alert(locale === 'ar' ? 'حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 8 ميجابايت.' : 'File size too large. Please select an image under 8MB.');
        event.target.value = ''; // Reset input
        return;
      }

      const newPreviews = [URL.createObjectURL(file)];
      setPreviews(newPreviews);

      field.onChange([file]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">{locale === 'ar' ? 'صورة السيارة (صورة واحدة)' : 'Car Photo (One Photo)'}</label>
      <div className="grid grid-cols-1 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="w-full h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(index, e)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              suppressHydrationWarning={true}
            />
            {preview ? (
              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-gray-400 text-xs text-center">
                {t('uploadSlot').replace('{number}', (index + 1).toString())}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const [currentLocale, setCurrentLocale] = useState('en');
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  
  // Registration Type State: 'individual' | 'group'
  const [registrationType, setRegistrationType] = useState<'individual' | 'group'>('individual');

  const [selectedMake, setSelectedMake] = useState<CarMake | null>(null);
  const [availableModels, setAvailableModels] = useState<CarModel[]>([]);
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+973');

  useEffect(() => {
    // Force detection from URL
    const urlPath = window.location.pathname;
    
    if (urlPath.includes('/ar')) {
      setCurrentLocale('ar');
    } else {
      setCurrentLocale('en');
    }
    
    // Set client flag to prevent hydration mismatch
    setIsClient(true);
  }, []);

  // Load car makes when component mounts
  useEffect(() => {
    const loadCarMakes = async () => {
      setLoadingMakes(true);
      try {
        const makes = await getCarMakes();
        setCarMakes(makes);
      } catch (error) {
        console.error('Failed to load car makes:', error);
      } finally {
        setLoadingMakes(false);
      }
    };

    loadCarMakes();
  }, []);

  // Load available events
  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      try {
        const availableEvents = await getEventsAction();
        setEvents(availableEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  const activeLocale = currentLocale;
  
  // Direct translation objects
  const translations = {
    ar: {
      title: 'التسجيل للفعالية',
      subtitle: 'انضم إلينا في لقاء معرض جودزيلا للسيارات ',
      individualRegistration: 'تسجيل فردي',
      groupRegistration: 'تسجيل قروب',
      fullName: 'الاسم الكامل',
      email: 'عنوان البريد الإلكتروني',
      phone: 'رقم الهاتف',
      event: 'الفعالية',
      selectEvent: 'اختر الفعالية',
      carMake: 'ماركة السيارة',
      selectMake: 'اختر ماركة السيارة',
      carModel: 'موديل السيارة',
      selectModel: 'اختر موديل السيارة',
      carYear: 'سنة الصنع',
      selectYear: 'اختر سنة الصنع',
      carPhotos: 'صورة السيارة (صورة واحدة)',
      uploadSlot: 'رفع الصورة {number}',
      agreeToTerms: 'أوافق على',
      termsLink: 'الشروط والأحكام',
      submit: 'إرسال التسجيل',
      submitting: 'جاري الإرسال...',
      successTitle: 'تم التسجيل بنجاح!',
      successText: 'شكراً لك على التسجيل! ستتلقى رسالة تأكيد بالبريد الإلكتروني قريباً.',
      backToHome: 'العودة للرئيسية',
      validation: {
        fullNameRequired: 'الاسم الكامل يجب أن يحتوي على 3 أحرف على الأقل',
        emailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
        phoneInvalid: 'يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)',
        eventRequired: 'يرجى اختيار الفعالية',
        carMakeRequired: 'يرجى اختيار ماركة السيارة',
        carModelRequired: 'يرجى اختيار موديل السيارة',
        carYearRequired: 'يرجى اختيار سنة الصنع',
        termsRequired: 'يجب الموافقة على الشروط والأحكام',
        photosRequired: 'يرجى رفع صورة واحدة على الأقل'
      }
    },
    en: {
      title: 'Register for the Event',
      subtitle: 'Join us at the Godzilla Car Show',
      individualRegistration: 'Individual Registration',
      groupRegistration: 'Group Registration',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      event: 'Event',
      selectEvent: 'Select event',
      carMake: 'Car Make',
      selectMake: 'Select car make',
      carModel: 'Car Model',
      selectModel: 'Select car model',
      carYear: 'Model Year',
      selectYear: 'Select model year',
      carPhotos: 'Car Photo (One Photo)',
      uploadSlot: 'Upload Image {number}',
      agreeToTerms: 'I agree to the',
      termsLink: 'Terms and Conditions',
      submit: 'Submit Registration',
      submitting: 'Submitting...',
      successTitle: 'Registration Successful!',
      successText: 'Thank you for registering! You will receive a confirmation email shortly.',
      backToHome: 'Back to Home',
      validation: {
        fullNameRequired: 'Full name must be at least 3 characters',
        emailInvalid: 'Please enter a valid email address',
        phoneInvalid: 'Please enter a valid phone number (at least 8 digits)',
        eventRequired: 'Please select an event',
        carMakeRequired: 'Please select a car make',
        carModelRequired: 'Please select a car model',
        carYearRequired: 'Please select a model year',
        termsRequired: 'You must agree to the terms and conditions',
        photosRequired: 'Please upload at least one photo'
      }
    }
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[activeLocale as 'ar' | 'en'];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const registrationSchema = z.object({
    eventId: z.string().nonempty(t('validation.eventRequired')),
    fullName: z.string().min(3, t('validation.fullNameRequired')),
    email: z.string().email(t('validation.emailInvalid')),
    countryCode: z.string().nonempty('يرجى اختيار كود الدولة'),
    phoneNumber: z.string().min(8, t('validation.phoneInvalid')),
    carMake: z.string().nonempty(t('validation.carMakeRequired')),
    carModel: z.string().nonempty(t('validation.carModelRequired')),
    carYear: z.string().nonempty(t('validation.carYearRequired')),
    carImages: z.array(z.any()).min(1, t('validation.photosRequired')).max(1),
    agreedToTerms: z.boolean().refine(val => val === true, { message: t('validation.termsRequired') }),
  });
  
  type RegistrationFormValues = z.infer<typeof registrationSchema>;
  const { control, register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
        carImages: [],
        countryCode: '+973'
    }
  });

  const watchedCarMake = watch('carMake');

  // Handle car make selection to update available models
  useEffect(() => {
    const loadModelsForMake = async () => {
      if (watchedCarMake) {
        const selectedMakeObj = carMakes.find(make => make.Make_Name === watchedCarMake);
        if (selectedMakeObj) {
          setSelectedMake(selectedMakeObj);
          setLoadingModels(true);
          try {
            const models = await getCarModels(selectedMakeObj.Make_Name);
            setAvailableModels(models);
          } catch (error) {
            console.error('Failed to load car models:', error);
            setAvailableModels([]);
          } finally {
            setLoadingModels(false);
          }
          setValue('carModel', ''); // Reset model selection when make changes
        }
      } else {
        setSelectedMake(null);
        setAvailableModels([]);
      }
    };

    loadModelsForMake();
  }, [watchedCarMake, setValue, carMakes]);

  // Server Action form submission
  const onSubmit = async (data: RegistrationFormValues) => {
    setFormError(null);
    
    const validFiles = data.carImages.filter(f => f instanceof File);
    if (validFiles.length === 0) {
      setFormError(t('validation.photosRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('eventId', data.eventId);
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('countryCode', data.countryCode);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('carMake', data.carMake);
    formData.append('carModel', data.carModel);
    formData.append('carYear', data.carYear);
    
    // Add all car images to FormData
    validFiles.forEach((file) => {
      formData.append('carImages', file);
    });

    startTransition(async () => {
      try {
        console.log('🚀 إرسال بيانات التسجيل...');
        const result = await registerAction(formData);
        
        console.log('📬 نتيجة التسجيل:', result);
        
        if (result.success) {
          console.log('✅ نجح التسجيل:', result.message);
          setFormSuccess(true);
          setFormError(null);
          reset();
        } else {
          console.error('❌ فشل التسجيل:', result.error);
          setFormError(result.message || result.error || 'فشل في التسجيل');
        }
      } catch (error: any) {
        console.error('❌ خطأ غير متوقع في التسجيل:', error);
        setFormError(error.message || 'حدث خطأ غير متوقع');
      }
    });
  };

  const modelYears = generateYears();

  if (formSuccess) {
    return (
      <div className={`min-h-screen bg-gray-900 text-white flex items-center justify-center text-center py-6 sm:py-12 px-4 ${activeLocale === 'ar' ? 'rtl' : 'ltr'}`} dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl w-full space-y-8 bg-gray-800 p-4 sm:p-10 rounded-xl shadow-lg">
          <h2 className="text-3xl font-extrabold text-green-400">{t('successTitle')}</h2>
          <p className="text-gray-300">{t('successText')}</p>
          
          <Link 
            href={`/${activeLocale}`}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state until client hydration is complete
  if (!isClient) {
    return (
      <div className={`min-h-screen bg-gray-900 text-white flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-2xl w-full space-y-8 bg-gray-800 p-4 sm:p-10 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-400">Loading registration form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 ${activeLocale === 'ar' ? 'rtl' : 'ltr'}`} dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl w-full space-y-8 bg-gray-800 p-4 sm:p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Improved Tab Switcher */}
        <div className="bg-gray-700 p-1 rounded-lg flex mb-8">
            <button
                type="button"
                onClick={() => setRegistrationType('individual')}
                className={`flex-1 py-3 text-sm font-bold rounded-md transition-all duration-300 ${
                    registrationType === 'individual' 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
            >
                {t('individualRegistration')}
            </button>
            <button
                type="button"
                onClick={() => setRegistrationType('group')}
                className={`flex-1 py-3 text-sm font-bold rounded-md transition-all duration-300 ${
                    registrationType === 'group' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
            >
                {t('groupRegistration')}
            </button>
        </div>
        
        {registrationType === 'individual' ? (
          <form className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning={true}>
            <div className="rounded-md shadow-sm flex flex-col gap-6">
              
              <div>
                <input 
                  {...register('fullName')} 
                  type="text" 
                  placeholder={t('fullName')} 
                  className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  suppressHydrationWarning={true}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <input 
                  {...register('email')} 
                  type="email" 
                  placeholder={t('email')} 
                  className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  suppressHydrationWarning={true}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select 
                    {...register('countryCode')}
                    value={selectedCountryCode}
                    onChange={(e) => {
                      setSelectedCountryCode(e.target.value);
                      setValue('countryCode', e.target.value);
                    }}
                    className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    suppressHydrationWarning={true}
                  >
                    <option value="+973">🇧🇭 البحرين +973</option>
                    <option value="+966">🇸🇦 السعودية +966</option>
                    <option value="+971">🇦🇪 الإمارات +971</option>
                    <option value="+965">🇰🇼 الكويت +965</option>
                    <option value="+974">🇶🇦 قطر +974</option>
                    <option value="+968">🇴🇲 عُمان +968</option>
                  </select>
                  {errors.countryCode && <p className="text-red-500 text-xs mt-1">{errors.countryCode.message}</p>}
                </div>
                
                <div>
                  <input 
                    {...register('phoneNumber')}
                    type="tel" 
                    placeholder={activeLocale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400"
                    suppressHydrationWarning={true}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                </div>
              </div>

              {/* Event Selection */}
              <div>
                <select 
                  {...register('eventId')} 
                  className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={loadingEvents}
                  suppressHydrationWarning={true}
                >
                  <option value="">{loadingEvents ? 'Loading events...' : t('selectEvent')}</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id.toString()}>{event.name}</option>
                  ))}
                </select>
                {errors.eventId && <p className="text-red-500 text-xs mt-1">{errors.eventId.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Car Make Dropdown */}
                <div>
                  <select 
                    {...register('carMake')} 
                    className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={loadingMakes}
                    suppressHydrationWarning={true}
                  >
                    <option value="">{loadingMakes ? 'Loading makes...' : t('selectMake')}</option>
                    {carMakes.map(make => (
                      <option key={make.Make_ID} value={make.Make_Name}>{make.Make_Name}</option>
                    ))}
                  </select>
                  {errors.carMake && <p className="text-red-500 text-xs mt-1">{errors.carMake.message}</p>}
                </div>
                
                {/* Car Model Dropdown (Cascading) */}
                <div>
                  <select 
                    {...register('carModel')} 
                    disabled={!selectedMake || loadingModels}
                    className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    suppressHydrationWarning={true}
                  >
                    <option value="">{loadingModels ? 'Loading models...' : t('selectModel')}</option>
                    {availableModels.map(model => (
                      <option key={model.Model_ID} value={model.Model_Name}>{model.Model_Name}</option>
                    ))}
                  </select>
                  {errors.carModel && <p className="text-red-500 text-xs mt-1">{errors.carModel.message}</p>}
                </div>

                {/* Model Year Dropdown */}
                <div>
                  <select 
                    {...register('carYear')} 
                    className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    suppressHydrationWarning={true}
                  >
                    <option value="">{t('selectYear')}</option>
                    {modelYears.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                  {errors.carYear && <p className="text-red-500 text-xs mt-1">{errors.carYear.message}</p>}
                </div>
              </div>
              
              <Controller
                control={control}
                name="carImages"
                render={({ field }) => (
                  <FileUploader control={control} name="carImages" t={t} locale={activeLocale} field={field} />
                )}
              />
              
              {errors.carImages && <p className="text-red-500 text-xs">{errors.carImages.message}</p>}

              <div className="flex items-center">
                <input 
                  {...register('agreedToTerms')} 
                  id="agreedToTerms" 
                  type="checkbox" 
                  className="h-4 w-4 text-red-600 rounded"
                  suppressHydrationWarning={true}
                />
                <label htmlFor="agreedToTerms" className={`${activeLocale === 'ar' ? 'mr-2' : 'mx-2'} block text-sm`}>
                  {t('agreeToTerms')} <Link href={`/${activeLocale}/terms`} target="_blank" className="font-medium text-red-500">{t('termsLink')}</Link>
                </label>
              </div>
              {errors.agreedToTerms && <p className="text-red-500 text-xs">{errors.agreedToTerms.message}</p>}
            </div>

            {formError && (
              <div className="text-red-500 text-sm text-center bg-red-100 border border-red-400 rounded p-2">
                {formError}
              </div>
            )}

            <div>
              <button 
                type="submit" 
                disabled={isPending} 
                className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-500 transition-colors"
                suppressHydrationWarning={true}
              >
                {isPending ? t('submitting') : t('submit')}
              </button>
            </div>
          </form>
        ) : (
          <GroupRegistrationForm t={t} locale={activeLocale} events={events} />
        )}
      </div>
    </div>
  );
}
