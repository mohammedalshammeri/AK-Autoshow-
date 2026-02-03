'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ScrollReveal';
import { submitSponsorRequest } from '@/actions/sponsor-actions';

// Language Switcher Component (Reused for consistency)
function LanguageSwitcher() {
  const [currentLoc, setCurrentLoc] = useState('en');
  
  useEffect(() => {
    const urlPath = window.location.pathname;
    if (urlPath.includes('/ar')) {
      setCurrentLoc('ar');
    } else {
      setCurrentLoc('en'); 
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Link href="/en/become-sponsor" className={`px-3 py-2 rounded-lg text-sm font-medium ${currentLoc === 'en' ? 'text-white bg-white/10' : 'text-gray-400'}`}>English</Link>
      <span className="text-gray-600">|</span>
      <Link href="/ar/become-sponsor" className={`px-3 py-2 rounded-lg text-sm font-medium ${currentLoc === 'ar' ? 'text-white bg-white/10' : 'text-gray-400'}`}>العربية</Link>
    </div>
  );
}

export default function BecomeSponsorClient() {
  const [currentLocale, setCurrentLocale] = useState('en');
  const [activeTab, setActiveTab] = useState('packages'); // packages or form

  useEffect(() => {
    const urlPath = window.location.pathname;
    if (urlPath.includes('/ar')) setCurrentLocale('ar');
    else setCurrentLocale('en');
  }, []);

  const isRTL = currentLocale === 'ar';

  const translations = {
    ar: {
      hero: {
        badge: 'فرصة محدودة للشركات المتميزة',
        title: 'لا تكتفِ بالمشاهدة.. كن أنت الحدث!',
        subtitle: 'انضم كراعي رسمي لأضخم تجمع للسيارات في البحرين. ضع علامتك التجارية أمام أكثر من 5000 زائر وشاهد مبيعاتك وتفاعلك يرتفع.',
        cta: 'احجز باقتك الآن',
        scroll: 'اكتشف المزايا'
      },
      stats: {
        title: 'لماذا ترعى AK Autoshow؟',
        visitors: 'زائر متوقع',
        cars: 'سيارة مشاركة',
        media: 'وصول إعلامي',
        satisfaction: 'رضا الشركاء'
      },
      packages: {
        title: 'اختر الباقة التي تناسب طموحك',
        silver: {
          name: 'باقة الظهور (فضية)',
          price: '70 د.ب',
          desc: 'مثالية للشركات الناشئة التي تبحث عن تواجد وانتشار.',
          features: [
            'شعارك على الموقع الإلكتروني',
            'منشور واحد على إنستغرام',
            'توزيع منشورات في الحدث',
            'شعار صغير على لوحة الرعاة'
          ]
        },
        gold: {
          name: 'باقة التميز (ذهبية)',
          price: '200 د.ب',
          desc: 'الخيار الأفضل للانتشار القوي والتفاعل المباشر مع الجمهور.',
          features: [
            'مساحة خاصة (Booth) 3x3',
            '3 منشورات على إنستغرام',
            'شعارك على تذاكر الدخول',
            'مقابلة فيديو حصرية',
            'شعار متوسط في جميع المطبوعات'
          ]
        },
        diamond: {
          name: 'باقة السيطرة (ماسي)',
          price: '500 د.ب',
          desc: 'للعلامات التجارية الكبرى التي تريد الهيمنة الكاملة على الحدث.',
          features: [
            'الظهور على المسرح الرئيسي والتعريف بالشركة',
            'شعاركم في الإيميلات وبطاقات الدعوة والقبول',
            'مساحة استراتيجية VIP مميزة',
            'تغطية إعلامية شاملة ومستمرة',
            'شعارك على سيارات العرض الرئيسية',
            'أكبر شعار في منطقة التصوير (Photo Booth)'
          ]
        }
      },
      form: {
        title: 'ابدأ قصة نجاحك معنا',
        name: 'اسم الشركة / الشخص',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        package: 'الباقة المهتم بها',
        submit: 'إرسال طلب الرعاية',
        success: 'تم إرسال طلبك بنجاح! سيتواصل معك فريق التسويق قريباً.'
      },
      backHome: 'العودة للرئيسية'
    },
    en: {
      hero: {
        badge: 'Limited Opportunity for Elite Brands',
        title: 'Don\'t Just Watch. BE The Event.',
        subtitle: 'Join as an official sponsor for Bahrain\'s largest auto show. Put your brand in front of 5000+ visitors and watch your engagement soar.',
        cta: 'Book Your Package',
        scroll: 'Discover Benefits'
      },
      stats: {
        title: 'Why Sponsor AK Autoshow?',
        visitors: 'Expected Visitors',
        cars: 'Participating Cars',
        media: 'Media Reach',
        satisfaction: 'Partner Success'
      },
      packages: {
        title: 'Choose Your Sponsorship Tier',
        silver: {
          name: 'Visibility (Silver)',
          price: '70 BHD',
          desc: 'Ideal for startups looking for presence and awareness.',
          features: [
            'Logo on Website',
            '1 Instagram Post',
            'Flyer Distribution',
            'Small Logo on Sponsors Wall'
          ]
        },
        gold: {
          name: 'Excellence (Gold)',
          price: '200 BHD',
          desc: 'Best choice for strong presence and direct engagement.',
          features: [
            'Private Booth Space 3x3',
            '3 Instagram Posts',
            'Logo on Tickets',
            'Exclusive Video Interview',
            'Medium Logo on all Prints'
          ]
        },
        diamond: {
          name: 'Dominance (Diamond)',
          price: '500 BHD',
          desc: 'For major brands demanding total event domination.',
          features: [
            'Main Stage Appearance & Live Mention',
            'Logo on Emails, Invites & Acceptance Cards',
            'Strategic VIP Space',
            'Comprehensive Media Coverage',
            'Branding on Show Cars',
            'Main Logo on Photo Booths'
          ]
        }
      },
      form: {
        title: 'Start Your Success Story',
        name: 'Company / Contact Name',
        phone: 'Phone Number',
        email: 'Email Address',
        package: 'Interested Package',
        submit: 'Submit Request',
        success: 'Request sent successfully! Our marketing team will contact you soon.'
      },
      backHome: 'Back to Home'
    }
  };

  const t = translations[isRTL ? 'ar' : 'en'];

  return (
    <div className={`min-h-screen bg-[#050505] text-white selection:bg-yellow-500 selection:text-black ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={`/${currentLocale}`} className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tighter group-hover:text-yellow-400 transition-colors">← {t.backHome}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[128px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <ScrollReveal>
            <div className="inline-block px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-semibold mb-6 animate-pulse">
              {t.hero.badge} 👑
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight bg-gradient-to-br from-white via-gray-200 to-gray-600 bg-clip-text text-transparent">
              {isRTL ? 'لا تكتفِ بالمشاهدة..' : "Don't Just Watch.."}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
                {isRTL ? 'كن أنت الحدث!' : 'BE The Event!'}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            <a 
              href="#packages"
              className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold text-xl hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(250,204,21,0.4)]"
            >
              {t.hero.cta}
              <svg className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { number: '5000+', label: t.stats.visitors, icon: '👥' },
                { number: '1000+', label: t.stats.cars, icon: '🏎️' },
                { number: '500K+', label: t.stats.media, icon: '📱' },
                { number: '100%', label: t.stats.satisfaction, icon: '⭐' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl text-center hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <div className="text-4xl font-black text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 bg-gradient-to-b from-[#050505] to-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              <span className="border-b-4 border-yellow-500 pb-2">{t.packages.title}</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Silver Package */}
            <ScrollReveal delay={0.1}>
              <div className="h-full bg-gray-900/50 border border-gray-700 rounded-3xl overflow-hidden hover:border-gray-500 transition-all duration-300 flex flex-col">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-300 mb-2">{t.packages.silver.name}</h3>
                  <div className="text-3xl font-black text-white mb-4">{t.packages.silver.price}</div>
                  <p className="text-gray-400 text-sm mb-6">{t.packages.silver.desc}</p>
                  <ul className="space-y-4 mb-8">
                    {t.packages.silver.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <span className="text-green-500 mt-1">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto p-8 pt-0">
                  <a href="#contact" className="block w-full py-3 rounded-xl border border-gray-600 text-center font-bold hover:bg-white hover:text-black transition-all">
                    {t.hero.cta}
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* Gold Package */}
            <ScrollReveal delay={0.2}>
              <div className="relative h-full bg-gradient-to-b from-gray-900 to-black border-2 border-yellow-500/50 rounded-3xl overflow-hidden transform md:-translate-y-4 hover:shadow-[0_0_40px_rgba(234,179,8,0.2)] transition-all duration-300 flex flex-col">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300"></div>
                <div className="p-8">
                  <div className="inline-block px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full mb-4">MOST POPULAR</div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">{t.packages.gold.name}</h3>
                  <div className="text-4xl font-black text-white mb-4">{t.packages.gold.price}</div>
                  <p className="text-gray-400 text-sm mb-6">{t.packages.gold.desc}</p>
                  <ul className="space-y-4 mb-8">
                    {t.packages.gold.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-white font-medium">
                        <span className="text-yellow-500 mt-1">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto p-8 pt-0">
                  <a href="#contact" className="block w-full py-4 rounded-xl bg-yellow-500 text-black text-center font-bold hover:bg-yellow-400 transition-all shadow-lg">
                    {t.hero.cta}
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* Diamond Package */}
            <ScrollReveal delay={0.3}>
              <div className="h-full bg-gradient-to-br from-gray-900 via-gray-900 to-[#1a1a1a] border border-cyan-500/30 rounded-3xl overflow-hidden hover:border-cyan-500/60 transition-all duration-300 flex flex-col">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-2">{t.packages.diamond.name}</h3>
                  <div className="text-3xl font-black text-white mb-4">{t.packages.diamond.price}</div>
                  <p className="text-gray-400 text-sm mb-6">{t.packages.diamond.desc}</p>
                  <ul className="space-y-4 mb-8">
                    {t.packages.diamond.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-200">
                        <span className="text-cyan-500 mt-1">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto p-8 pt-0">
                  <a href="#contact" className="block w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-center font-bold hover:opacity-90 transition-all">
                    {t.hero.cta}
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-10">{t.form.title}</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const result = await submitSponsorRequest(formData);

              if (result.success) {
                alert(t.form.success);

                // WhatsApp redirection
                const name = formData.get('name');
                const phone = formData.get('phone');
                const pkg = formData.get('package');
                
                const text = isRTL 
                  ? `مرحباً، أنا مهتم برعاية معرض السيارات.\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالباقة: ${pkg}`
                  : `Hello, I am interested in sponsoring the car show.\nName: ${name}\nPhone: ${phone}\nPackage: ${pkg}`;
                
                window.location.href = `https://wa.me/97338409977?text=${encodeURIComponent(text)}`;
              } else {
                alert('Something went wrong. Please try again.');
              }
            }}>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{t.form.name}</label>
                  <input name="name" type="text" required className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">{t.form.phone}</label>
                  <input name="phone" type="tel" required className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors" />
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-400 mb-2 text-sm">{t.form.package}</label>
                <select name="package" className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 focus:border-yellow-500 focus:outline-none transition-colors text-white">
                  <option value="Silver" className="bg-black">{isRTL ? 'باقة الظهور (فضية)' : 'Visibility (Silver)'}</option>
                  <option value="Gold" className="bg-black">{isRTL ? 'باقة التميز (ذهبية)' : 'Excellence (Gold)'}</option>
                  <option value="Diamond" className="bg-black">{isRTL ? 'باقة السيطرة (ماسي)' : 'Dominance (Diamond)'}</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:scale-[1.01]">
                {t.form.submit}
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
