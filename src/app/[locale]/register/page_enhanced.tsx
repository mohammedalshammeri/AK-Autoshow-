'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from '@/routing';
import { registerAction } from '@/app/actions';
import { getCarMakes, getCarModels, type CarMake, type CarModel } from '@/lib/carApiService';
import { getAvailableEvents, type Event } from '@/lib/eventsService';

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
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newPreviews = [...previews];
      newPreviews[index] = URL.createObjectURL(file);
      setPreviews(newPreviews);

      const currentFiles = field.value ? [...field.value] : [];
      currentFiles[index] = file;
      field.onChange(currentFiles);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">{t('carPhotos')}</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="w-full h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(index, e)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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

export default function RegisterPage() {  const [currentLocale, setCurrentLocale] = useState('en');
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [selectedMake, setSelectedMake] = useState<CarMake | null>(null);
  const [availableModels, setAvailableModels] = useState<CarModel[]>([]);  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);  const [events, setEvents] = useState<any[]>([]);
    useEffect(() => {
    const urlPath = window.location.pathname;
    console.log('🔍 Register URL Path:', urlPath);
    
    if (urlPath.includes('/ar')) {
      console.log('🎯 Detected Arabic from URL');
      setCurrentLocale('ar');
    } else {
      console.log('🎯 Detected English from URL');
      setCurrentLocale('en');
    }
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

  // Load events when component mounts
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsList = await getAvailableEvents();
        setEvents(eventsList);
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };

    loadEvents();
  }, []);

  const activeLocale = currentLocale;
  
  // Direct translation objects
  const translations = {
    ar: {      title: 'التسجيل للفعالية',
      subtitle: 'انضم إلينا في فعاليات السيارات 2025',
      event: 'الفعالية',
      selectEvent: 'اختر الفعالية',
      fullName: 'الاسم الكامل',
      email: 'عنوان البريد الإلكتروني',
      phone: 'رقم الهاتف',
      carMake: 'ماركة السيارة',
      selectMake: 'اختر ماركة السيارة',
      carModel: 'موديل السيارة',
      selectModel: 'اختر موديل السيارة',
      carYear: 'سنة الصنع',
      selectYear: 'اختر سنة الصنع',
      carPhotos: 'صور السيارة (حتى 4 صور)',
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
        carMakeRequired: 'يرجى اختيار ماركة السيارة',
        carModelRequired: 'يرجى اختيار موديل السيارة',        carYearRequired: 'يرجى اختيار سنة الصنع',
        eventRequired: 'يرجى اختيار الفعالية',
        termsRequired: 'يجب الموافقة على الشروط والأحكام',
        photosRequired: 'يرجى رفع صورة واحدة على الأقل'
      }
    },
    en: {      title: 'Register for the Event',
      subtitle: 'Join us at the Car Events 2025',
      event: 'Event',
      selectEvent: 'Select Event',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      carMake: 'Car Make',
      selectMake: 'Select car make',
      carModel: 'Car Model',
      selectModel: 'Select car model',
      carYear: 'Model Year',
      selectYear: 'Select model year',
      carPhotos: 'Car Photos (Up to 4 images)',
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
    phoneNumber: z.string().min(8, t('validation.phoneInvalid')),
    carMake: z.string().nonempty(t('validation.carMakeRequired')),
    carModel: z.string().nonempty(t('validation.carModelRequired')),
    carYear: z.string().nonempty(t('validation.carYearRequired')),
    carImages: z.array(z.any()).min(1, t('validation.photosRequired')).max(4),
    agreedToTerms: z.boolean().refine(val => val === true, { message: t('validation.termsRequired') }),
  });
  
  type RegistrationFormValues = z.infer<typeof registrationSchema>;

  const { control, register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
        carImages: []
    }
  });

  const watchedCarMake = watch('carMake');  // Handle car make selection to update available models
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
    }    const formData = new FormData();
    formData.append('eventId', data.eventId);
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('carMake', data.carMake);
    formData.append('carModel', data.carModel);
    formData.append('carYear', data.carYear);
    
    validFiles.forEach((file) => {
      formData.append('carImages', file);
    });

    startTransition(async () => {
      try {
        const result = await registerAction(formData);
        
        if (result.success) {
          setFormSuccess(true);
          reset();
        } else {
          setFormError(result.error || 'Registration failed');
        }
      } catch (error: any) {
        setFormError(error.message || 'An unexpected error occurred');
      }
    });
  };
  const modelYears = generateYears();

  if (formSuccess) {
    return (
      <div className={`min-h-screen bg-gray-900 text-white flex items-center justify-center text-center py-12 px-4 ${activeLocale === 'ar' ? 'rtl' : 'ltr'}`} dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg">
          <h2 className="text-3xl font-extrabold text-green-400">{t('successTitle')}</h2>
          <p className="text-gray-300">{t('successText')}</p>
          <Link 
            href="/" 
            locale={activeLocale as 'ar' | 'en'}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${activeLocale === 'ar' ? 'rtl' : 'ltr'}`} dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl w-full space-y-8 bg-gray-800 p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {t('subtitle')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm flex flex-col gap-6">
            <div>
              <input 
                {...register('fullName')} 
                type="text" 
                placeholder={t('fullName')} 
                className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" 
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            
            <div>
              <input 
                {...register('email')} 
                type="email" 
                placeholder={t('email')} 
                className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" 
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>            <div>
              <input 
                {...register('phoneNumber')} 
                type="tel" 
                placeholder={t('phone')} 
                className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" 
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
            </div>

            {/* Event Selection */}
            <div>
              <select 
                {...register('eventId')} 
                className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">{t('selectEvent')}</option>                {events.map(event => (
                  <option key={event.id} value={event.id.toString()}>
                    {event.name} {event.event_date && `- ${new Date(event.event_date).toLocaleDateString(activeLocale === 'ar' ? 'ar-SA' : 'en-US')}`}
                  </option>
                ))}
              </select>
              {errors.eventId && <p className="text-red-500 text-xs mt-1">{errors.eventId.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Car Make Dropdown */}
              <div>                <select 
                  {...register('carMake')} 
                  className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={loadingMakes}
                >                  <option value="">{loadingMakes ? 'Loading makes...' : t('selectMake')}</option>
                  {carMakes.map(make => (
                    <option key={make.Make_ID} value={make.Make_Name}>{make.Make_Name}</option>
                  ))}
                </select>
                {errors.carMake && <p className="text-red-500 text-xs mt-1">{errors.carMake.message}</p>}
              </div>
              
              {/* Car Model Dropdown (Cascading) */}
              <div>                <select 
                  {...register('carModel')} 
                  disabled={!selectedMake || loadingModels}
                  className="bg-gray-700 w-full px-3 py-3 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >                  <option value="">{loadingModels ? 'Loading models...' : t('selectModel')}</option>
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
              />
              <label htmlFor="agreedToTerms" className={`${activeLocale === 'ar' ? 'mr-2' : 'mx-2'} block text-sm`}>
                {t('agreeToTerms')} <Link href="/terms" locale={activeLocale as 'ar' | 'en'} target="_blank" className="font-medium text-red-500">{t('termsLink')}</Link>
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
            >
              {isPending ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
