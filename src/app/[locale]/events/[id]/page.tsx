'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Play, Calendar, MapPin, Users, Trophy, Instagram, Facebook, Youtube, Twitter, CheckCircle2, Sparkles } from 'lucide-react';

interface EventData {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  description: string;
  description_ar: string;
  description_en: string;
  event_date: string;
  location: string;
  location_ar: string;
  location_en: string;
  event_type: string;
  registration_count: number;
  max_participants: number;
  settings: any;
}

export default function EventLandingPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const isArabic = locale === 'ar';

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load event (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setEvent(null);
        setLoading(false);
      });
  }, [id]);

  const t = (key: string) => {
    const translations: any = {
      ar: {
        register: 'سجل الآن',
        participants: 'متسابق مسجل',
        available: 'مقعد متاح',
        whenWhere: 'متى وأين؟',
        whyParticipate: 'لماذا تشارك؟',
        prizes: 'الجوائز',
        schedule: 'جدول الفعالية',
        sponsors: 'الرعاة',
        gallery: 'معرض الصور',
        socialMedia: 'تابعنا',
        organizedBy: 'تنظيم',
        allRightsReserved: 'جميع الحقوق محفوظة',
        features: ['تنافس مع أفضل اللاعبين', 'جوائز قيمة للفائزين', 'تغطية إعلامية مباشرة', 'فعاليات ترفيهية مصاحبة'],
        scheduleItems: [
          { time: '08:00 AM', title: 'التسجيل والفحص الفني', desc: 'استلام البطاقات وفحص السيارات' },
          { time: '10:00 AM', title: 'الجولة التأهيلية', desc: 'تحديد المتأهلين للمراحل النهائية' },
          { time: '02:00 PM', title: 'البطولة الرئيسية', desc: 'التنافس على اللقب' },
          { time: '06:00 PM', title: 'حفل التتويج', desc: 'توزيع الجوائز والكؤوس' }
        ]
      },
      en: {
        register: 'Register Now',
        participants: 'Registered',
        available: 'Slots Available',
        whenWhere: 'When & Where?',
        whyParticipate: 'Why Participate?',
        prizes: 'Prizes',
        schedule: 'Event Schedule',
        sponsors: 'Our Sponsors',
        gallery: 'Gallery',
        socialMedia: 'Follow Us',
        organizedBy: 'Organized by',
        allRightsReserved: 'All Rights Reserved',
        features: ['Compete with top racers', 'Valuable prizes for winners', 'Live media coverage', 'Entertainment activities'],
        scheduleItems: [
          { time: '08:00 AM', title: 'Registration & Technical Inspection', desc: 'Collect badges and inspect vehicles' },
          { time: '10:00 AM', title: 'Qualifying Round', desc: 'Determine finalists' },
          { time: '02:00 PM', title: 'Main Championship', desc: 'Compete for the title' },
          { time: '06:00 PM', title: 'Award Ceremony', desc: 'Prize distribution' }
        ]
      }
    };
    return translations[locale]?.[key] || key;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p>Event not found</p>
        </div>
      </div>
    );
  }

  const eventName = isArabic ? event.name_ar : event.name_en;
  const eventDesc = isArabic ? event.description_ar : event.description_en;
  const eventLocation = isArabic ? event.location_ar : event.location_en;
  const spotsLeft = event.max_participants - event.registration_count;

  const isDriftEvent = event?.event_type === 'drift';

  return (
    <div className={`min-h-screen ${isDriftEvent ? 'bg-black' : 'bg-gray-50'} text-white ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* Hero Video Section - DRIFT Special Design */}
      <section className={`relative h-screen overflow-hidden ${isDriftEvent ? 'bg-gradient-to-br from-black via-red-950/30 to-black' : 'bg-black'}`}>
        
        {/* Animated Background Elements for Drift */}
        {isDriftEvent && (
          <>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-64 h-64 bg-red-600 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            <div className="absolute inset-0 bg-[url('/tire-marks.png')] opacity-5 bg-repeat"></div>
          </>
        )}

        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          {showVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster={isDriftEvent ? "/drift-hero.jpg" : "/placeholder-hero.jpg"}
            >
              <source src={isDriftEvent ? "/drift-video.mp4" : "/event-hero-video.mp4"} type="video/mp4" />
            </video>
          ) : (
            <img 
              src={isDriftEvent ? "/drift-hero.jpg" : "/placeholder-hero.jpg"} 
              alt="Event Hero" 
              className="w-full h-full object-cover"
              onLoad={() => setShowVideo(true)}
            />
          )}
          <div className={`absolute inset-0 ${isDriftEvent ? 'bg-gradient-to-b from-black via-black/60 to-black' : 'bg-gradient-to-b from-black/70 via-black/50 to-black'}`}></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <header className="p-6 flex justify-between items-center backdrop-blur-sm bg-black/20">
            {isDriftEvent ? (
              <img src="/j2drift-logo.png" alt="J2drift" className="h-16 md:h-20" onError={(e) => e.currentTarget.src='/ak-autoshow-logo-new.png'} />
            ) : (
              <img src="/ak-autoshow-logo-new.png" alt="AKA" className="h-12 md:h-16" />
            )}
            <div className="flex gap-4">
              <Link 
                href={`/${locale}`}
                className={`${isDriftEvent ? 'text-yellow-400 hover:text-white' : 'text-white hover:text-red-500'} transition font-bold text-lg`}
              >
                {isArabic ? 'الرئيسية' : 'Home'}
              </Link>
            </div>
          </header>

          {/* Hero Content */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-4xl">
              <div className={`inline-flex items-center gap-2 ${isDriftEvent ? 'bg-gradient-to-r from-red-600 to-yellow-600 animate-pulse' : 'bg-red-600/20 border border-red-600/50'} rounded-full px-6 py-3 mb-8 shadow-2xl ${isDriftEvent ? 'shadow-red-600/50' : ''}`}>
                <Sparkles className={`w-5 h-5 ${isDriftEvent ? 'text-white animate-spin' : 'text-red-500'}`} />
                <span className="text-sm md:text-base font-black uppercase tracking-wider text-white">
                  {event.event_type === 'drift' ? (isArabic ? '🔥 بطولة دريفت احترافية 🔥' : '🔥 Pro Drift Championship 🔥') : 'Car Show'}
                </span>
              </div>
              
              <h1 className={`text-6xl md:text-9xl font-black mb-8 leading-tight uppercase ${isDriftEvent ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)] animate-pulse' : ''}`}>
                {eventName}
              </h1>
              
              <p className={`text-xl md:text-3xl ${isDriftEvent ? 'text-yellow-300 font-black uppercase tracking-wide' : 'text-gray-300'} mb-8 max-w-2xl mx-auto`}>
                {eventDesc}
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-gray-800">
                  <Calendar className="inline w-5 h-5 mb-1 text-red-500" />
                  <span className="ml-2">{new Date(event.event_date).toLocaleDateString(isArabic ? 'ar-BH' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-gray-800">
                  <MapPin className="inline w-5 h-5 mb-1 text-red-500" />
                  <span className="ml-2">{eventLocation}</span>
                </div>
              </div>

              <Link 
                href={`/${locale}/e/${id}`}
                className={`inline-flex items-center gap-3 ${isDriftEvent ? 'bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 hover:from-yellow-400 hover:to-yellow-400 text-black font-black' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold'} px-12 py-6 rounded-full text-xl md:text-2xl transition-all transform hover:scale-110 shadow-2xl ${isDriftEvent ? 'shadow-yellow-600/70 animate-pulse' : 'shadow-red-900/50'}`}
              >
                {isDriftEvent ? (isArabic ? '🏁 سجل الآن !' : '🏁 REGISTER NOW !') : t('register')}
                <Play className="w-6 h-6" />
              </Link>

              <div className="mt-8 flex justify-center gap-8 text-sm">
                <div>
                  <div className="text-3xl font-bold text-red-500">{event.registration_count}</div>
                  <div className="text-gray-400">{t('participants')}</div>
                </div>
                <div className="border-l border-gray-700"></div>
                <div>
                  <div className="text-3xl font-bold text-green-500">{spotsLeft}</div>
                  <div className="text-gray-400">{t('available')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="pb-8 flex justify-center animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Participate Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            {t('whyParticipate')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t('features').map((feature: string, index: number) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-red-600 transition">
                <CheckCircle2 className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-lg font-bold">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            {t('schedule')}
          </h2>
          <div className="space-y-4">
            {t('scheduleItems').map((item: any, index: number) => (
              <div key={index} className="bg-black/50 border border-gray-800 rounded-xl p-6 flex items-start gap-6 hover:border-red-600 transition">
                <div className="text-red-500 font-mono font-bold text-xl min-w-[100px]">{item.time}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-16">
            {t('sponsors')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4,5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur border border-gray-800 rounded-xl p-8 flex items-center justify-center hover:border-white/20 transition">
                <div className="text-6xl">🏁</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            {t('socialMedia')}
          </h2>
          <div className="flex justify-center gap-6">
            <a href="#" className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:scale-110 transition">
              <Instagram className="w-8 h-8" />
            </a>
            <a href="#" className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition">
              <Facebook className="w-8 h-8" />
            </a>
            <a href="#" className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 transition">
              <Youtube className="w-8 h-8" />
            </a>
            <a href="#" className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center hover:scale-110 transition">
              <Twitter className="w-8 h-8" />
            </a>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            {t('gallery')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition cursor-pointer">
                <img 
                  src={`/placeholder-hero.jpg`} 
                  alt={`Gallery ${i}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-900 via-red-700 to-red-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-6">
            {isArabic ? 'مستعد للتحدي؟' : 'Ready for the Challenge?'}
          </h2>
          <p className="text-xl mb-8 text-red-100">
            {isArabic ? `متبقي ${spotsLeft} مقعد فقط!` : `Only ${spotsLeft} spots left!`}
          </p>
          <Link 
            href={`/${locale}/e/${id}`}
            className="inline-flex items-center gap-3 bg-black hover:bg-gray-900 text-white font-bold px-12 py-6 rounded-full text-2xl transition-all transform hover:scale-105"
          >
            {t('register')}
            <Trophy className="w-8 h-8" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <img src="/ak-autoshow-logo-new.png" alt="AKA" className="h-16 mx-auto mb-6" />
          <p className="text-gray-400 mb-4">
            {t('organizedBy')} <span className="text-white font-bold">AKA Auto Show</span>
          </p>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} {t('allRightsReserved')}
          </p>
        </div>
      </footer>

    </div>
  );
}
