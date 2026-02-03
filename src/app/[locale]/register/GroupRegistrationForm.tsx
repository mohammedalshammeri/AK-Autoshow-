'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerGroupAction } from '@/app/actions';
import { getCarMakes, getCarModels, type CarMake, type CarModel } from '@/lib/carApiService';

// Reuse types/generators from parent if possible, but copying for independence is safer here
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1980; year--) {
    years.push(year);
  }
  return years;
};

interface GroupFormProps {
  t: (key: string) => string;
  locale: string;
  events: any[];
}

export default function GroupRegistrationForm({ t, locale, events }: GroupFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Car Data States
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  
  // Cache for models: { "Toyota": [models...], "Nissan": [models...] }
  const [modelsCache, setModelsCache] = useState<Record<string, CarModel[]>>({});

  useEffect(() => {
    getCarMakes().then(makes => {
      setCarMakes(makes);
      setLoadingMakes(false);
    });
  }, []);

  const loadModels = async (make: string) => {
    if (!make || modelsCache[make]) return;
    try {
      const models = await getCarModels(make);
      setModelsCache(prev => ({ ...prev, [make]: models }));
    } catch (err) {
      console.error(err);
    }
  };

  const schema = z.object({
    eventId: z.string().min(1, t('validation.eventRequired')),
    fullName: z.string().min(3, t('validation.fullNameRequired')),
    groupName: z.string().min(2, locale === 'ar' ? 'اسم القروب مطلوب' : 'Group Name is required'),
    email: z.string().email(t('validation.emailInvalid')),
    countryCode: z.string(),
    phoneNumber: z.string().min(8, t('validation.phoneInvalid')),
    groupType: z.enum(['same', 'mixed']),
    carCount: z.number().min(2).max(20),
    // Cars array
    cars: z.array(z.object({
      make: z.string().min(1),
      model: z.string().min(1),
      year: z.string().min(1),
      plateNumber: z.string().min(1, 'رقم اللوحة مطلوب')
    })),
    agreedToTerms: z.boolean().refine((v) => v === true, {
      message: t('validation.termsRequired')
    })
  });

  type SchemaType = z.infer<typeof schema>;

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      groupType: 'mixed',
      carCount: 2,
      countryCode: '+973',
      cars: Array(2).fill({ make: '', model: '', year: '', plateNumber: '' })
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "cars"
  });

  const watchedCarCount = watch('carCount');
  const watchedGroupType = watch('groupType');

  // Sync field array size with car count
  useEffect(() => {
    const currentLength = fields.length;
    if (watchedCarCount > currentLength) {
      for (let i = 0; i < watchedCarCount - currentLength; i++) {
        append({ make: '', model: '', year: '', plateNumber: '' });
      }
    } else if (watchedCarCount < currentLength) {
      for (let i = 0; i < currentLength - watchedCarCount; i++) {
        remove(fields.length - 1);
      }
    }
  }, [watchedCarCount, append, remove, fields.length]);

  const onSubmit = (data: SchemaType) => {
    setFormError(null);
    const formData = new FormData();
    formData.append('eventId', data.eventId);
    formData.append('fullName', data.fullName);
    formData.append('groupName', data.groupName);
    formData.append('email', data.email);
    formData.append('countryCode', data.countryCode);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('groupType', data.groupType);

    // Validate images
    const carsData = data.cars.map((car, index) => {
      // Handle file directly from the input ref if possible, or assume it's storing File object
      // With react-hook-form Controller, we store the FileList or File
      return {
        make: car.make,
        model: car.model,
        year: car.year,
        plateNumber: car.plateNumber
      };
    });

    formData.append('carsData', JSON.stringify(carsData));

    startTransition(async () => {
      const res = await registerGroupAction(formData);
      if (res.success) {
        setFormSuccess(true);
        setSuccessData(res);
      } else {
        setFormError(res.error || 'Failed');
      }
    });
  };

  const modelYears = generateYears();

  if (formSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-900/50 p-6 rounded-xl border border-green-500">
          <h2 className="text-3xl font-bold text-green-400">تم تسجيل القروب بنجاح!</h2>
          <p className="text-gray-300 mt-2">رقم الطلب: {successData?.registrationNumber}</p>
          <p className="text-sm text-gray-400 mt-4">تم إرسال {successData?.qrCodes?.length} باركود إلى بريدك الإلكتروني.</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-left overflow-auto max-h-96" dir="ltr">
             <h3 className="text-white font-bold mb-2">Generated QR Codes (Preview):</h3>
             {successData?.qrCodes?.map((qr: any, i: number) => (
                 <div key={i} className="flex justify-between items-center bg-gray-700 p-2 mb-2 rounded">
                     <span>{qr.plate}</span>
                     <span className="font-mono text-xs bg-black px-2 py-1 rounded text-green-400">{qr.code.substring(0,8)}...</span>
                 </div>
             ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Leader Info */}
      <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 space-y-4">
        <h3 className="text-xl font-bold text-purple-400 border-b border-gray-700 pb-2 mb-4">
          {locale === 'ar' ? 'بيانات مدير القروب' : 'Group Leader Info'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">{locale === 'ar' ? 'اسم مدير القروب' : 'Group Manager Name'}</label>
            <input {...register('fullName')} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white" />
            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
          </div>
           <div>
            <label className="block text-sm text-gray-400 mb-1">{locale === 'ar' ? 'اسم القروب' : 'Group Name'}</label>
            <input {...register('groupName')} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white" />
            {errors.groupName && <p className="text-red-500 text-xs">{errors.groupName.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('email')}</label>
            <input {...register('email')} type="email" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
                <select {...register('countryCode')} className="w-1/3 bg-gray-900 border border-gray-700 rounded p-3 text-white">
                    <option value="+973">🇧🇭 +973</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+968">🇴🇲 +968</option>
                </select>
                <input {...register('phoneNumber')} placeholder="XXXXXXXX" className="w-2/3 bg-gray-900 border border-gray-700 rounded p-3 text-white" />
            </div>
             <div>
                 <label className="block text-sm text-gray-400 mb-1">{t('event')}</label>
                <select {...register('eventId')} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white">
                    <option value="">{t('selectEvent')}</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                {errors.eventId && <p className="text-red-500 text-xs">{errors.eventId.message}</p>}
             </div>
        </div>
      </div>

      {/* 2. Group Configuration */}
      <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 space-y-4">
        <h3 className="text-xl font-bold text-yellow-500 border-b border-gray-700 pb-2 mb-4">
             {locale === 'ar' ? 'إعدادات القروب' : 'Group Settings'}
        </h3>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-between">
            <div className="w-full md:w-1/2">
                <label className="block text-sm text-gray-400 mb-2">{locale === 'ar' ? 'عدد السيارات' : 'Number of Cars'}</label>
                <input 
                    type="number" 
                    {...register('carCount', { valueAsNumber: true })} 
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-2xl font-mono text-center"
                    min={2} max={20}
                />
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col gap-2">
                 <label className="block text-sm text-gray-400">{locale === 'ar' ? 'نوع القروب' : 'Group Type'}</label>
                 <div className="flex gap-4">
                    <label className={`flex-1 cursor-pointer p-3 md:p-4 rounded-lg border ${watchedGroupType === 'same' ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-900 border-gray-700'}`}>
                        <input type="radio" value="same" {...register('groupType')} className="hidden" />
                        <div className="text-center font-bold text-white text-sm md:text-base">{locale === 'ar' ? 'نوع واحد' : 'Single Make'}</div>
                        <div className="text-xs text-gray-400 text-center mt-1">{locale === 'ar' ? 'مثلاً: كلهم موستنج' : 'e.g. All Mustangs'}</div>
                    </label>
                    <label className={`flex-1 cursor-pointer p-3 md:p-4 rounded-lg border ${watchedGroupType === 'mixed' ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-900 border-gray-700'}`}>
                        <input type="radio" value="mixed" {...register('groupType')} className="hidden" />
                        <div className="text-center font-bold text-white text-sm md:text-base">{locale === 'ar' ? 'مختلط' : 'Mixed'}</div>
                        <div className="text-xs text-gray-400 text-center mt-1">{locale === 'ar' ? 'أنواع مختلفة' : 'Various Makes'}</div>
                    </label>
                 </div>
            </div>
        </div>
      </div>

      {/* 3. Cars List */}
      <div className="space-y-4">
         <h3 className="text-xl font-bold text-white mb-4">{locale === 'ar' ? 'تفاصيل السيارات' : 'Cars Details'}</h3>
         
         {fields.map((field, index) => (
             <div key={field.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 relative">
                 <div className="absolute top-2 left-2 text-4xl md:text-6xl font-black text-gray-700/20 select-none">{index + 1}</div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                     {/* Make */}
                     <div>
                         <label className="text-xs text-gray-400">{t('carMake')}</label>
                         <select 
                            {...register(`cars.${index}.make` as const)}
                            onChange={(e) => {
                                register(`cars.${index}.make`).onChange(e);
                                loadModels(e.target.value);
                            }}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                         >
                             <option value="">{t('selectMake')}</option>
                             {carMakes.map(m => <option key={m.Make_ID} value={m.Make_Name}>{m.Make_Name}</option>)}
                         </select>
                     </div>

                     {/* Model */}
                     <div>
                         <label className="text-xs text-gray-400">{t('carModel')}</label>
                         <select 
                            {...register(`cars.${index}.model` as const)}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                         >
                            <option value="">{t('selectModel')}</option>
                             {(modelsCache[watch(`cars.${index}.make`)] || []).map(m => (
                                 <option key={m.Model_ID} value={m.Model_Name}>{m.Model_Name}</option>
                             ))}
                         </select>
                     </div>

                     {/* Year */}
                     <div>
                         <label className="text-xs text-gray-400">{t('carYear')}</label>
                            <select 
                            {...register(`cars.${index}.year` as const)} 
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm"
                            >
                            <option value="">{t('selectYear')}</option>
                            {modelYears.map(year => (
                                <option key={year} value={year.toString()}>{year}</option>
                            ))}
                            </select>
                     </div>

                     {/* Plate Number */}
                     <div>
                         <label className="text-xs text-yellow-500 font-bold">{locale === 'ar' ? 'رقم اللوحة' : 'Plate Number'}</label>
                         <input 
                            {...register(`cars.${index}.plateNumber` as const)}
                            className="w-full bg-gray-900 border border-yellow-600 rounded p-2 text-white text-sm text-center font-mono placeholder-gray-600"
                            placeholder="1234 ABC"
                         />
                         {errors.cars?.[index]?.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.cars[index]?.plateNumber?.message}</p>}
                     </div>

                 </div>
             </div>
         ))}
      </div>

      <div className="flex items-center gap-2">
            <input type="checkbox" {...register('agreedToTerms')} id="terms" className="w-5 h-5 text-purple-600" />
            <label htmlFor="terms" className="text-sm text-gray-300">{t('agreeToTerms')} <span className="text-purple-400">{t('termsLink')}</span></label>
      </div>
      
      {errors.agreedToTerms && <p className="text-red-500 text-center">{errors.agreedToTerms.message}</p>}
      {formError && <p className="text-red-500 text-center bg-red-900/20 p-2 rounded">{formError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (locale === 'ar' ? 'جاري التسجيل...' : 'Registering...') : (locale === 'ar' ? 'تسجيل القروب' : 'Register Group')}
      </button>

    </form>
  );
}
