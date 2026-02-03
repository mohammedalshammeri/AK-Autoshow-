'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TermsPage() {
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    // Detect language from URL
    const path = window.location.pathname;
    setIsArabic(path.startsWith('/ar'));
  }, []);

  const content = {
    ar: {
      title: "الشروط والأحكام",
      lastUpdated: "آخر تحديث: يناير 2026",
      introduction: "مرحباً بكم في AKAutoshow. باستخدام منصتنا والمشاركة في فعالياتنا، فإنكم توافقون على الالتزام بالشروط والأحكام التالية:",
      section1Title: "1. قوانين المرور والسلامة",
      section1Content: "جميع المشاركين ملزمون بالالتزام بقوانين المرور المحلية وقواعد السلامة. السرعة المسموحة في موقع الفعالية هي 20 كم/ساعة كحد أقصى. يُمنع منعاً باتاً القيادة المتهورة أو العروض الخطيرة.",
      section2Title: "2. الاحترام والسلوك",
      section2Content: "نتوقع من جميع المشاركين إظهار الاحترام المتبادل والسلوك المهذب. يُمنع استخدام اللغة النابية أو السلوك العدواني. أي مخالفة لهذه القواعد قد تؤدي إلى الإخراج من الفعالية.",
      section3Title: "3. حالة المركبة",
      section3Content: "يجب أن تكون جميع المركبات في حالة جيدة وآمنة. نحتفظ بالحق في فحص أي مركبة ورفض دخولها إذا لم تستوف معايير السلامة. المالكون مسؤولون عن أي أضرار قد تلحق بمركباتهم.",
      section4Title: "4. الإعلام والتصوير",
      section4Content: "بمشاركتكم في الفعالية، فإنكم توافقون على استخدام صوركم ومقاطع الفيديو الخاصة بكم لأغراض التسويق والترويج. احترموا خصوصية الآخرين ولا تصوروا بدون إذن.",
      section5Title: "5. المسؤولية القانونية",
      section5Content: "AKAutoshow غير مسؤولة عن أي حوادث أو أضرار أو خسائر قد تحدث أثناء الفعالية. المشاركة على مسؤوليتكم الشخصية. ننصح بشدة بوجود تأمين شامل على مركباتكم.",
      backToRegister: "العودة للتسجيل",
      backToHome: "الصفحة الرئيسية"
    },
    en: {
      title: "Terms and Conditions",
      lastUpdated: "Last updated: January 2026",
      introduction: "Welcome to AKAutoshow. By using our platform and participating in our events, you agree to comply with the following terms and conditions:",
      section1Title: "1. Traffic Laws and Safety",
      section1Content: "All participants must comply with local traffic laws and safety regulations. The maximum speed limit within the event area is 20 km/h. Reckless driving or dangerous stunts are strictly prohibited.",
      section2Title: "2. Respect and Conduct",
      section2Content: "We expect all participants to show mutual respect and courteous behavior. Profanity, aggressive behavior, or harassment will not be tolerated. Any violation may result in removal from the event.",
      section3Title: "3. Vehicle Condition",
      section3Content: "All vehicles must be in good and safe condition. We reserve the right to inspect any vehicle and refuse entry if it doesn't meet safety standards. Owners are responsible for any damage to their vehicles.",
      section4Title: "4. Media and Photography",
      section4Content: "By participating, you consent to the use of your images and videos for marketing and promotional purposes. Please respect others' privacy and do not photograph without permission.",
      section5Title: "5. Legal Liability",
      section5Content: "AKAutoshow is not responsible for any accidents, damages, or losses that may occur during the event. Participation is at your own risk. We strongly recommend comprehensive insurance for your vehicles.",
      backToRegister: "Back to Registration",
      backToHome: "Home"
    }
  };

  const t = isArabic ? content.ar : content.en;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-4xl mx-auto bg-gray-800 p-10 rounded-xl shadow-lg ${isArabic ? 'text-right' : 'text-left'}`}>
        <div className="text-center mb-8">          <Link href="/" className="text-2xl font-bold text-white mb-4 inline-block">
            AK<span className="text-red-500">Autoshow</span>
          </Link>
          <h1 className="text-3xl font-extrabold mb-4">
            {t.title}
          </h1>
          <p className="text-gray-400">{t.lastUpdated}</p>
        </div>

        {/* Introduction */}
        <div className="mb-8 p-6 bg-red-900/20 border border-red-600 rounded-lg">
          <p className={`text-gray-200 leading-relaxed text-lg ${isArabic ? 'text-right' : 'text-left'}`}>
            {t.introduction}
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Traffic Laws */}
          <div className="border-b border-gray-600 pb-6">
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              {t.section1Title}
            </h3>
            <p className={`text-gray-300 leading-relaxed ${isArabic ? 'text-right' : 'text-left'}`}>
              {t.section1Content}
            </p>
          </div>

          {/* Section 2: Respect and Conduct */}
          <div className="border-b border-gray-600 pb-6">
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              {t.section2Title}
            </h3>
            <p className={`text-gray-300 leading-relaxed ${isArabic ? 'text-right' : 'text-left'}`}>
              {t.section2Content}
            </p>
          </div>

          {/* Section 3: Vehicle Condition */}
          <div className="border-b border-gray-600 pb-6">
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              {t.section3Title}
            </h3>
            <p className={`text-gray-300 leading-relaxed ${isArabic ? 'text-right' : 'text-left'}`}>
              {t.section3Content}
            </p>
          </div>

          {/* Section 4: Media and Photography */}
          <div className="border-b border-gray-600 pb-6">
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              {t.section4Title}
            </h3>
            <p className={`text-gray-300 leading-relaxed ${isArabic ? 'text-right' : 'text-left'}`}>
              {t.section4Content}
            </p>
          </div>

          {/* Section 5: Liability */}
          <div>
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              {t.section5Title}
            </h3>
            <p className={`text-gray-300 leading-relaxed ${isArabic ? 'text-right' : 'text-left'}`}>
              {t.section5Content}
            </p>
          </div>
        </div>

        {/* Language Switch and Navigation */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            href={isArabic ? "/en/terms" : "/ar/terms"}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isArabic ? "English" : "العربية"}
          </Link>
          <Link 
            href={isArabic ? "/ar/register" : "/en/register"}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            {t.backToRegister}
          </Link>
          <Link 
            href={isArabic ? "/ar" : "/en"} 
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
