'use client';

import React, { useState, useEffect, useTransition, use } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { notFound } from 'next/navigation';
import { registerDynamicEventAction } from '@/app/_actions';
// Removed Dropdown imports as requested (will be text inputs)

// --- Types ---
interface EventSettings {
  requires_cpr?: boolean;
  allow_passengers?: boolean;
  show_car_category?: boolean;
  terms_ar?: string;
  terms_en?: string;
}

interface EventData {
  id: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  event_type?: 'drift' | 'carshow' | 'exhibition';
  settings: EventSettings;
}

// --- Components ---
const FileUploader = ({ control, name, label, t, field, required = false }: any) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target?.result as string);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
      field.onChange(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`w-full h-32 border-2 border-dashed ${field.value ? 'border-green-500' : 'border-gray-600'} rounded-xl flex items-center justify-center relative hover:bg-gray-800/50 transition-colors`}>
        <input type="file" onChange={handleFile} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
        {preview ? (
          <img src={preview} className="h-full object-contain rounded-lg p-1" />
        ) : (
          <div className="text-center text-gray-500 text-sm">
            {isProcessing ? 'Processing...' : (t('clickToUpload') || 'Click to Upload')}
          </div>
        )}
      </div>
    </div>
  );
};

export default function DynamicEventPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = use(params);

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [currentLocale, setCurrentLocale] = useState(locale);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [regId, setRegId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Translation Helper
  // Drift-specific detailed terms
  const getDriftTerms = () => {
    if (currentLocale === 'ar') {
      return `
1️⃣ الالتزام بالأنظمة والقوانين
أُقر بالتزامي الكامل بجميع القوانين والأنظمة المعمول بها في المملكة، وبالقوانين الخاصة بالفعالية.

2️⃣ التعاون مع المنظمين
أتعهد بالتعاون الكامل مع المنظمين والمشرفين، وتنفيذ التعليمات الصادرة منهم لضمان سلامة الجميع.

3️⃣ معايير السلامة للمركبة
أُقر بأن مركبتي:
  • في حالة صالحة للاستخدام وخالية من الأعطال
  • مزودة بحزام أمان معتمد
  • ثبات المقعد
  • تثبيت البطارية - مع وجود قاطع للطوارئ
  • التأكد من توصيلات الوقود
  • عدم وجود أي نوع من التسريبات ( الزيت / الماء / الوقود )
  • توافر طفاية حريق داخل السيارة

4️⃣ حالة المتسابق
في حاله وجود راكب: أُقر بأنني سليم جسدياً لا أعاني من اي نوع من الاعاقات و لايكون تحت أي نوع من المنشطات و العقاقير.

5️⃣ الملابس والمعدات
يفضل توفير ملابس مخصصه لرياضة السيارات وسيتم فحصها من قبل المنظمين:
  • البدله + القفاز + الحذاء + الخوذة المخصصة لرياضة السيارات
في حاله عدم توافرها:
  • تيشيرت + جينز + حذاء + خوذة

6️⃣ عدم التدخين
أتعهد بعدم التدخين عند الفحص أو التجهيز عند الانطلاقة.

7️⃣ عدم الاستعراض
أتعهد بعدم الاستعراض أو القيادة بشكل خطر في غير الأماكن المخصصة للسباق.

8️⃣ عدم الإزعاج
أتعهد بعدم إصدار أصوات مزعجة من المحرك خارج أوقات السباق المحددة.

⚠️ ملاحظة هامة:
لن يتم قبول أي سيارة في حال عدم جاهزيتها في منطقة الفحص و التسجيل.
      `.trim();
    }

    return `
1️⃣ Compliance with laws & regulations
I confirm full compliance with all applicable laws and the event regulations.

2️⃣ Cooperation with organizers
I commit to fully cooperate with organizers and supervisors and follow their instructions to ensure everyone’s safety.

3️⃣ Vehicle safety standards
I confirm my vehicle:
  • Is roadworthy and free of critical defects
  • Has an approved seat belt
  • Has a secure / stable seat
  • Has a securely mounted battery with an emergency cut-off
  • Has secured fuel connections
  • Has no leaks (oil / water / fuel)
  • Has a fire extinguisher inside the car

4️⃣ Driver condition
If a passenger is present: I confirm I am physically fit, not under the influence of stimulants or drugs, and have no condition that may affect safe participation.

5️⃣ Clothing & equipment
Motorsport gear is preferred and will be inspected by organizers:
  • Suit + gloves + shoes + motorsport helmet
If unavailable:
  • T-shirt + jeans + shoes + helmet

6️⃣ No smoking
I commit to no smoking during inspection, preparation, or staging.

7️⃣ No unsafe driving outside track
I commit not to perform stunts or drive dangerously outside the designated racing areas.

8️⃣ No nuisance
I commit not to create excessive engine noise outside the scheduled race times.

⚠️ Important note:
Any car will be rejected if it is not ready in the inspection/registration area.
    `.trim();
  };

  const t = (key: string) => {
    const dict: any = {
      ar: {
        step1: '1. البيانات الشخصية',
        step2: '2. تفاصيل السيارة',
        step3: '3. السلامة والموافقة',
        title: 'تسجيل المتسابقين',
        driverInfo: 'بيانات السائق',
        fullName: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        cpr: 'الرقم الشخصي',
        cprPhoto: 'صورة الهوية',
        carInfo: 'بيانات المركبة',
        make: 'نوع السيارة (مثال: نيسان)',
        model: 'موديل السيارة (مثال: سيلفيا)',
        year: 'السنة',
        category: 'الفئة',
        carPhoto: 'صور السيارة',
        passengerInfo: 'بيانات الراكب / المعاون',
        hasPassenger: 'يوجد معي مساعد/ميكانيكي',
        pName: 'اسم المساعد',
        pCpr: 'هوية المساعد',
        pMobile: 'رقم جوال المساعد',
        pCprPhoto: 'صورة هوية المساعد',
        emergency: 'للطوارئ',
        eName: 'اسم الشخص',
        eNumber: 'رقم الطوارئ',
        safetyTitle: 'فحص السلامة الذاتي',
        safetyDesc: 'أقر بأن سيارتي تحتوي على معدات السلامة التالية:',
        s_helmet: 'خوذة معتمدة',
        s_suit: 'بدلة سباق',
        s_rollcage: 'قفص سلامة (Roll Cage)',
        s_extinguisher: 'طفاية حريق مثبتة',
        s_battery: 'تثبيت البطارية بإحكام',
        s_seatbelt: 'حزام الأمان',
        s_seat: 'ثبات المقعد',
        s_cutoff: 'قاطع طوارئ للبطارية',
        s_fuel: 'توصيلات الوقود',
        s_no_leaks: 'عدم وجود تسريبات (زيت/ماء/وقود)',
        s_no_smoking: 'عدم التدخين عند الفحص/التجهيز',
        submit: 'إرسال الطلب',
        submitting: 'جاري الإرسال...',
        success: 'تم التسجيل بنجاح!',
        next: 'التالي',
        back: 'السابق',
        terms: 'الشروط والأحكام',
        agree: 'أقر بأن جميع البيانات صحيحة وأوافق على الشروط',
        successMsg: 'تم استلام طلبك. سيتم مراجعة الطلب من قبل المنظمين، وفي حال القبول سيصلك "اسم المستخدم" الخاص بك للدخول إلى نظام الجولات.'
      },
      en: {
        step1: '1. Personal Info',
        step2: '2. Car Details',
        step3: '3. Safety & Terms',
        title: 'Racer Registration',
        driverInfo: 'Driver Information',
        fullName: 'Full Name',
        phone: 'Phone Number',
        email: 'Email',
        cpr: 'CPR / ID',
        cprPhoto: 'ID Photo',
        carInfo: 'Vehicle Information',
        make: 'Car Make (e.g. Nissan)',
        model: 'Car Model (e.g. Silvia)',
        year: 'Year',
        category: 'Category',
        carPhoto: 'Car Photos',
        passengerInfo: 'Co-Driver / Mechanic Info',
        hasPassenger: 'I have a Co-Driver/Mechanic',
        pName: 'Name',
        pCpr: 'ID Number',
        pMobile: 'Mobile Number',
        pCprPhoto: 'ID Photo',
        emergency: 'Emergency Contact',
        eName: 'Contact Name',
        eNumber: 'Number',
        safetyTitle: 'Self Safety Check',
        safetyDesc: 'I certify my car has the following:',
        s_helmet: 'Approved Helmet',
        s_suit: 'Vail Racing Suit',
        s_rollcage: 'Roll Cage',
        s_extinguisher: 'Fixed Fire Extinguisher',
        s_battery: 'Secure Battery Mount',
        s_seatbelt: 'Seat Belt',
        s_seat: 'Seat Secure / Stable',
        s_cutoff: 'Battery Emergency Cut-Off',
        s_fuel: 'Fuel Connections Secured',
        s_no_leaks: 'No Leaks (oil/water/fuel)',
        s_no_smoking: 'No smoking during inspection/staging',
        submit: 'Submit Application',
        submitting: 'Submitting...',
        success: 'Registration Successful!',
        next: 'Next',
        back: 'Back',
        terms: 'Terms & Conditions',
        agree: 'I confirm data is correct & agree to terms',
        successMsg: 'Application received. Once approved by organizers, you will receive your credentials to access the rounds system.'
      }
    };
    return dict[currentLocale]?.[key] || key;
  };

  // Form Schema
  const schema = z.object({
    // Step 1
    fullName: z.string().min(3),
    email: z.string().email(),
    countryCode: z.string(),
    phoneNumber: z.string().min(8),
    driverCpr: z.string().optional(),
    driverCprPhoto: z.any().optional(),
    emergencyName: z.string().optional(),
    emergencyNumber: z.string().optional(),
    
    // Passenger
    hasPassenger: z.boolean().optional(),
    passengerName: z.string().optional(),
    passengerCpr: z.string().optional(),
    passengerMobile: z.string().optional(),
    passengerCprPhoto: z.any().optional(),

    // Step 2
    carMake: z.string().min(1, 'Make is required'),
    carModel: z.string().min(1, 'Model is required'),
    carYear: z.string().min(4, 'Year is required'),
    carCategory: z.string().optional(),
    carImages: z.any().optional(),

    // Step 3
    safetyChecklist: z.array(z.string()).optional(),
    agreed: z.literal(true)
  });

  const { register, handleSubmit, control, watch, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      countryCode: '+973',
      hasPassenger: false,
      safetyChecklist: []
    }
  });

  // Fetch Logic
  useEffect(() => {
    setIsLoading(true);
    setErrorMsg(null);

    fetch(`/api/events/${id}`)
      .then(async (res) => {
        if (res.ok) return res.json();

        if (res.status === 404) {
          throw new Error('EVENT_NOT_FOUND');
        }

        const bodyText = await res.text().catch(() => '');
        throw new Error(`EVENT_LOAD_FAILED:${res.status}:${bodyText.slice(0, 200)}`);
      })
      .then((data) => {
        setEventData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setEventData(null);
        setIsLoading(false);

        const message = String(err?.message || '');
        if (message === 'EVENT_NOT_FOUND') {
          setErrorMsg(currentLocale === 'ar' ? 'الفعالية غير موجودة.' : 'Event not found.');
        } else {
          setErrorMsg(currentLocale === 'ar'
            ? 'تعذر تحميل بيانات الفعالية. يرجى المحاولة مرة أخرى.'
            : 'Failed to load event details. Please try again.');
        }
      });
  }, [id]);

  const settings = eventData?.settings || {};

  const validateStep = async (currentStep: number) => {
    setErrorMsg(null);
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['fullName', 'email', 'phoneNumber', 'driverCprPhoto'];
      if (settings.requires_cpr) fieldsToValidate.push('driverCpr');
        if (watch('hasPassenger')) {
            fieldsToValidate.push('passengerName', 'passengerCpr', 'passengerMobile', 'passengerCprPhoto');
        }
    } else if (currentStep === 2) {
        fieldsToValidate = ['carMake', 'carModel', 'carYear', 'carImages'];
    }

    const result = await trigger(fieldsToValidate);

    if (currentStep === 1) {
      const cprPhoto = watch('driverCprPhoto');
      if (!cprPhoto || !(cprPhoto instanceof File) || cprPhoto.size <= 0) {
        setErrorMsg(currentLocale === 'ar'
          ? 'صورة الهوية مطلوبة.'
          : 'ID photo is required.');
        return;
      }

      if (settings.requires_cpr) {
        const cpr = String(watch('driverCpr') || '').trim();
        if (!cpr) {
          setErrorMsg(currentLocale === 'ar'
            ? 'الرقم الشخصي مطلوب.'
            : 'CPR/ID number is required.');
          return;
        }
      }

      if (settings.allow_passengers && watch('hasPassenger')) {
        const pName = String(watch('passengerName') || '').trim();
        const pCpr = String(watch('passengerCpr') || '').trim();
        const pMobile = String(watch('passengerMobile') || '').trim();
        const pPhoto = watch('passengerCprPhoto');

        if (!pName || !pCpr || !pMobile || !pPhoto) {
          setErrorMsg(currentLocale === 'ar'
            ? 'بيانات المساعد كاملة مطلوبة (الاسم/الهوية/الجوال/الصورة).'
            : 'Passenger/co-driver info is required (name/ID/mobile/photo).');
          return;
        }
      }
    }

    if (currentStep === 2) {
      const carImage = watch('carImages');
      if (!carImage || !(carImage instanceof File) || carImage.size <= 0) {
        setErrorMsg(currentLocale === 'ar'
          ? 'صورة السيارة مطلوبة.'
          : 'Car photo is required.');
        return;
      }
    }

    if (result) setStep(currentStep + 1);
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append('eventId', id);
    
    // Core Fields
    Object.keys(data).forEach(key => {
        if (['driverCprPhoto', 'passengerCprPhoto', 'carImages', 'safetyChecklist'].includes(key)) return;
        formData.append(key, data[key]);
    });

    if (data.safetyChecklist) {
        formData.append('safetyChecklist', JSON.stringify(data.safetyChecklist));
    }

    // Files
    if (data.driverCprPhoto) formData.append('driverCprPhoto', data.driverCprPhoto);
    if (data.passengerCprPhoto) formData.append('passengerCprPhoto', data.passengerCprPhoto);
    if (data.carImages) formData.append('carImages', data.carImages);

    startTransition(async () => {
        const res = await registerDynamicEventAction(formData);
        if (res.success) {
            setSuccess(true);
            setRegId(res.registrationNumber || 'PENDING');
        }
        else setErrorMsg(res.message);
    });
  };

  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (!eventData) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{errorMsg || 'Event not found'}</div>;

  const isDriftEvent = eventData.event_type === 'drift';

  if (success) return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 text-center">
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 max-w-lg">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">{t('success')}</h1>
              <p className="text-gray-400 mb-6 leading-relaxed">{t('successMsg')}</p>
              <div className="bg-black p-4 rounded-lg font-mono text-xl text-yellow-500 border border-gray-800">
                  ID: {regId}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                  <p className="text-gray-400 mb-4">
                      {currentLocale === 'ar'
                        ? 'QR لخدمات التسويق والتطوير من BSMC'
                        : 'QR for marketing & development services by BSMC'}
                  </p>
                  <div className="flex items-center justify-center">
                      <img
                        src={`/api/qr?size=220&data=${encodeURIComponent('https://www.bsmc.bh')}`}
                        alt="BSMC QR"
                        className="w-56 h-56 bg-white rounded-xl p-2"
                      />
                  </div>
                  <a
                    href="https://www.bsmc.bh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-sm text-gray-300 hover:text-white underline"
                  >
                    www.bsmc.bh
                  </a>
              </div>
          </div>
      </div>
  );

  return (
    <div className={`min-h-screen bg-black text-white p-4 md:p-8 ${currentLocale === 'ar' ? 'rtl' : 'ltr'}`} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto">
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-0"></div>
            {[1, 2, 3].map((s) => (
                <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                    {s}
                </div>
            ))}
        </div>

        <header className="mb-8 text-center">
            {isDriftEvent && (
              <div className="mb-6 flex justify-center">
                <img src="/j2drift-logo.png" alt="J2drift" className="h-20 md:h-28 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
              </div>
            )}
            <h1 className="text-4xl font-black text-white mb-2">{eventData.name}</h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900/50 p-6 md:p-10 rounded-3xl border border-gray-800 shadow-2xl">
           
           {/* STEP 1: Personal Info */}
           {step === 1 && (
               <div className="space-y-6 animate-fadeIn">
                   <h3 className="text-2xl font-bold text-red-500 mb-6">{t('step1')}</h3>
                   
                   <div className="bg-black/30 p-6 rounded-xl border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label className="text-sm text-gray-400 block mb-2">{t('fullName')}</label>
                           <input {...register('fullName')} className="w-full bg-gray-800 rounded-lg p-3 border border-gray-700 outline-none focus:border-red-500" />
                           {errors.fullName && <span className="text-red-500 text-xs">Required</span>}
                       </div>
                       
                       <div>
                           <label className="text-sm text-gray-400 block mb-2">{t('phone')}</label>
                           <div className="flex gap-2">
                               <select {...register('countryCode')} className="bg-gray-800 rounded-lg p-3 border border-gray-700 w-1/3">
                                   <option value="+973">+973</option>
                                   <option value="+966">+966</option>
                               </select>
                               <input {...register('phoneNumber')} className="w-2/3 bg-gray-800 rounded-lg p-3 border border-gray-700 outline-none focus:border-red-500" />
                           </div>
                       </div>
                       
                       <div className="md:col-span-2">
                           <label className="text-sm text-gray-400 block mb-2">{t('email')}</label>
                           <input type="email" {...register('email')} className="w-full bg-gray-800 rounded-lg p-3 border border-gray-700 outline-none focus:border-red-500" />
                       </div>

                       {settings.requires_cpr && (
                         <div>
                           <label className="text-sm text-gray-400 block mb-2">{t('cpr')}</label>
                           <input {...register('driverCpr')} className="w-full bg-gray-800 rounded-lg p-3 border border-gray-700 outline-none focus:border-red-500" />
                         </div>
                       )}

                       <div className={settings.requires_cpr ? '' : 'md:col-span-2'}>
                         <Controller
                           control={control}
                           name="driverCprPhoto"
                           render={({ field }) => <FileUploader label={t('cprPhoto')} t={t} field={field} required />}
                         />
                       </div>
                   </div>

                   {/* Passenger Toggle */}
                   {settings.allow_passengers && (
                       <div className="bg-gray-800/20 p-6 rounded-xl border border-gray-700/50">
                           <div className="flex items-center gap-3 mb-4">
                               <input type="checkbox" {...register('hasPassenger')} className="w-6 h-6 rounded accent-red-600" />
                               <label className="font-bold text-lg">{t('hasPassenger')}</label>
                           </div>

                           {watch('hasPassenger') && (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                                   <div>
                                       <label className="text-sm text-gray-400 mb-2 block">{t('pName')}</label>
                                       <input {...register('passengerName')} className="w-full bg-gray-800 rounded-lg p-3 border border-gray-700" />
                                   </div>
                                   <div>
                                       <label className="text-sm text-gray-400 mb-2 block">{t('pCpr')}</label>
                                       <input {...register('passengerCpr')} className="w-full bg-gray-800 rounded-lg p-3 border border-gray-700" />
                                   </div>
                                     <div className="md:col-span-2">
                                       <label className="text-sm text-gray-400 mb-2 block">{t('pMobile')}</label>
                                       <input {...register('passengerMobile')} className="w-full bg-gray-800 rounded-lg p-3 border border-gray-700" />
                                     </div>
                                   <div className="md:col-span-2">
                                       <Controller 
                                           control={control}
                                           name="passengerCprPhoto"
                                           render={({ field }) => <FileUploader label={t('pCprPhoto')} t={t} field={field} />}
                                       />
                                   </div>
                               </div>
                           )}
                       </div>
                   )}
                   
                   <div className="flex justify-end pt-4">
                       <button type="button" onClick={() => validateStep(1)} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                           {t('next')} ➜
                       </button>
                   </div>
               </div>
           )}

           {/* STEP 2: Car Info (Text Inputs) */}
           {step === 2 && (
               <div className="space-y-6 animate-fadeIn">
                   <h3 className="text-2xl font-bold text-red-500 mb-6">{t('step2')}</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                           <label className="text-sm text-gray-400 mb-2 block">{t('category')}</label>
                           <select {...register('carCategory')} className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700 text-lg">
                               <option value="headers">Headers (هدرز)</option>
                               <option value="turbo">Turbo (تيربو)</option>
                               <option value="4x4">4x4 (دفع رباعي)</option>
                           </select>
                       </div>

                       {/* Changed from Select to Input Text */}
                       <div>
                           <label className="text-sm text-gray-400 mb-2 block">{t('make')}</label>
                           <input type="text" {...register('carMake')} placeholder="e.g. Nissan" className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700 focus:border-red-500 outline-none" />
                           {errors.carMake && <span className="text-red-500 text-sm">Required</span>}
                       </div>
                       <div>
                           <label className="text-sm text-gray-400 mb-2 block">{t('model')}</label>
                           <input type="text" {...register('carModel')} placeholder="e.g. 350z" className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700 focus:border-red-500 outline-none" />
                           {errors.carModel && <span className="text-red-500 text-sm">Required</span>}
                       </div>
                       
                       <div>
                           <label className="text-sm text-gray-400 mb-2 block">{t('year')}</label>
                           <input type="number" {...register('carYear')} className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700 focus:border-red-500 outline-none" />
                       </div>
                       
                       <div className="md:col-span-2">
                           <Controller 
                               control={control}
                               name="carImages"
                               rules={{ required: true }}
                               render={({ field }) => <FileUploader label={t('carPhoto')} t={t} field={field} required />}
                           />
                       </div>
                   </div>

                   <div className="flex justify-between pt-6">
                       <button type="button" onClick={() => setStep(1)} className="bg-gray-800 text-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-700 transition">
                           {t('back')}
                       </button>
                       <button type="button" onClick={() => validateStep(2)} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                           {t('next')} ➜
                       </button>
                   </div>
               </div>
           )}

           {/* STEP 3: Safety & Terms */}
           {step === 3 && (
               <div className="space-y-6 animate-fadeIn">
                   <h3 className="text-2xl font-bold text-red-500 mb-6">{t('step3')}</h3>
                   
                   {/* Safety Checklist */}
                   <div className="bg-yellow-900/10 border border-yellow-700/30 p-6 rounded-xl">
                       <h4 className="text-yellow-500 font-bold mb-4 flex items-center gap-2">
                           ⚠️ {t('safetyTitle')}
                       </h4>
                       <p className="text-gray-400 text-sm mb-4">{t('safetyDesc')}</p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {[
                           's_helmet',
                           's_suit',
                           's_rollcage',
                           's_extinguisher',
                           's_battery',
                           's_seatbelt',
                           's_seat',
                           's_cutoff',
                           's_fuel',
                           's_no_leaks',
                           's_no_smoking',
                           ].map((item) => (
                               <label key={item} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg hover:bg-black/60 cursor-pointer">
                                   <input type="checkbox" value={item} {...register('safetyChecklist')} className="w-5 h-5 rounded accent-yellow-500" />
                                   <span className="text-sm text-gray-300">{t(item)}</span>
                               </label>
                           ))}
                       </div>
                   </div>

                   {/* Terms Scroll - Show detailed terms for drift events */}
                   <div 
                     className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 relative"
                   >
                     <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                       📜 {t('terms')}
                     </h4>
                     
                     <div 
                        className="h-64 overflow-y-auto pr-2 custom-scrollbar space-y-4 text-sm text-gray-300 leading-7 bg-gray-900/50 p-4 rounded-lg border border-gray-800"
                        onScroll={(e) => {
                          const element = e.currentTarget;
                          // Increased buffer to 50px to ensure it triggers easily on all devices
                          const isScrolledToBottom = (element.scrollHeight - element.scrollTop) <= (element.clientHeight + 50);
                          
                          if (isScrolledToBottom && !hasScrolledTerms) {
                            setHasScrolledTerms(true);
                          }
                        }}
                     >
                         {isDriftEvent ? (
                           <div className="space-y-6">
                             {getDriftTerms().split('\n\n').map((block, i) => (
                               <div key={i} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                                 {block.split('\n').map((line, j) => (
                                   <p key={j} className={j === 0 ? "font-bold text-yellow-400 mb-2" : "text-gray-300 pl-4 border-l-2 border-gray-700"}>
                                     {line}
                                   </p>
                                 ))}
                               </div>
                             ))}
                             {/* Force extra space at bottom to ensure scroll is possible */}
                             <div className="h-10"></div>
                           </div>
                         ) : (
                           <p className="whitespace-pre-wrap">
                             {currentLocale === 'ar' ? (settings.terms_ar || t('terms')) : (settings.terms_en || t('terms'))}
                           </p>
                         )}
                     </div>

                     {!hasScrolledTerms && (
                       <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                          <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce flex items-center gap-2">
                            ⬇️ {currentLocale === 'ar' ? 'يجب قراءة الشروط للنهاية' : 'Scroll to bottom to agree'}
                          </span>
                       </div>
                     )}
                   </div>
                   
                   <label className={`flex gap-3 items-start p-4 rounded-xl cursor-pointer transition-all ${
                     hasScrolledTerms ? 'bg-gray-800/40 border border-gray-700 hover:bg-gray-800' : 'bg-gray-900/80 border border-red-900/50 opacity-60 cursor-not-allowed'
                   }`}>
                       <Controller
                         name="agreed"
                         control={control}
                         defaultValue={false}
                         render={({ field: { onChange, value } }) => (
                           <input 
                             type="checkbox" 
                             disabled={!hasScrolledTerms}
                             checked={value}
                             onChange={(e) => {
                               // Update react-hook-form state
                               onChange(e.target.checked);
                               // Update local state for button enabling
                               setAgreedToTerms(e.target.checked);
                             }}
                             className="w-6 h-6 rounded accent-red-600 mt-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" 
                           />
                         )}
                       />
                       <span className="text-gray-300 text-sm font-bold select-none">
                         {hasScrolledTerms ? t('agree') : (currentLocale === 'ar' ? '⚠️ اقرأ الشروط كاملة أولاً' : '⚠️ Read all terms first')}
                       </span>
                   </label>
                   {hasScrolledTerms && (
                     <p className="text-green-500 text-xs text-center">✅ {currentLocale === 'ar' ? 'تم قراءة الشروط' : 'Terms read'}</p>
                   )}
                   
                   {errors.agreed && <p className="text-red-500 text-center">You must agree to continue</p>}
                   {errorMsg && <p className="text-red-500 text-center bg-red-900/20 p-2 rounded">{errorMsg}</p>}

                   <div className="flex justify-between pt-6">
                       <button type="button" onClick={() => setStep(2)} className="bg-gray-800 text-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-700 transition">
                           {t('back')}
                       </button>
                       <button disabled={isPending || !hasScrolledTerms || !agreedToTerms} type="submit" className="bg-gradient-to-r from-red-600 to-red-800 text-white px-10 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto">
                           {isPending ? t('submitting') : t('submit')}
                       </button>
                   </div>
               </div>
           )}

        </form>
      </div>
    </div>
  );
}