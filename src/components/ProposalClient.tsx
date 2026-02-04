'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ProposalClient() {
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    const isAr = window.location.pathname.includes('/ar');
    setCurrentLocale(isAr ? 'ar' : 'en');
  }, []);

  const isRTL = currentLocale === 'ar';

  const content = {
    ar: {
      nav: {
        brand: 'AK AUTOSHOW',
        id: 'BAHRAIN-2026-GCC',
        confidential: 'وثيقة شراكة استراتيجية'
      },
      hero: {
        label: 'الحدث الأضخم للسيارات في البحرين | 2026',
        title: 'فرصة الوصول لأكبر تجمع شبابي خليجي في مكان واحد',
        subtitle: 'أكثر من 5,000 زائر و 1,500 سيارة مشاركة من كافة دول الخليج. منصتكم المباشرة للوصول إلى فئة الشباب وعشاق السيارات بفعالية لا تضاهى.',
        stats: [
          { value: '5,000+', label: 'زائر وحضور جماهيري' },
          { value: '1,500+', label: 'سيارة معدلة وفارهة' },
          { value: 'GCC', label: 'حضور من كافة دول الخليج' }
        ]
      },
      valueProp: {
        title: 'لماذا هذا الحدث هو فرصتكم؟',
        items: [
          {
            header: 'تجمع خليجي ضخم',
            text: 'نستقطب المشاركين من السعودية، الكويت، الإمارات، قطر، وعمان. علامتكم التجارية لن تخاطب البحرين فقط، بل السوق الخليجي بأكمله في حدث واحد.'
          },
          {
            header: 'الوصول المباشر للشباب',
            text: 'الفرصة الأقوى للبنوك والشركات للتواجد في قلب تجمعات الشباب، تقديم العروض التمويلية، وفتح قنوات تواصل مباشرة مع جيل يبحث عن التميز.'
          },
          {
            header: 'جمهور نوعي (High Intent)',
            text: 'الحضور ليسوا مجرد متفرجين، بل ملاك سيارات وعشاق ينفقون بسخاء على هواياتهم، مما يجعلهم "عملاء مثاليين" لخدمات التمويل، التأمين، وقطاع السيارات.'
          }
        ]
      },
      media: {
        title: 'زخم إعلامي لا يهدأ',
        subtitle: 'حملة تسويقية 360 درجة تضمن وصول علامتكم التجارية لكل بيت وشاشة',
        items: [
          {
            head: 'تغطية المؤثرين (Influencers)',
            desc: 'استضافة نخبة من مشاهير السيارات وصناع المحتوى في الخليج لنقل الحدث لملايين المتابعين.'
          },
          {
            head: 'الصحافة والقنوات (Press & TV)',
            desc: 'تغطية إخبارية رسمية عبر الصحف المحلية، القنوات التلفزيونية، والإذاعات الرائدة لضمان المصداقية.'
          },
          {
            head: 'هيمنة رقمية (Digital Reach)',
            desc: 'حملات إعلانية مدفوعة ومكثفة تستهدف الجمهور بدقة عبر كافة منصات التواصل الاجتماعي.'
          }
        ]
      },
      vision: {
        title: 'أبعاد استراتيجية تتجاوز التسويق',
        items: [
          {
            head: 'التوافق مع الرؤية الوطنية',
            desc: 'شراكتكم لا تدعم حدثاً فحسب، بل تصب في دعم السياحة الوطنية واجتذاب القوة الشرائية الخليجية إلى المملكة.'
          },
          {
            head: 'المسؤولية الاجتماعية (CSR)',
            desc: 'تمكين الشباب البحريني وتوفير منصة آمنة واحترافية لإبراز مواهبهم هو استثمار في جيل المستقبل.'
          },
          {
            head: 'شبكة علاقات النخبة (B2B)',
            desc: 'منطقة كبار الشخصيات تتيح لكم التواصل المباشر مع ملاك الوكالات، كبار المستثمرين، وصناع القرار في قطاع الرفاهية.'
          }
        ]
      },
      sectorSpecific: {
        banks: {
          title: 'لقطاع البنوك والتمويل',
          points: [
            'فرصة ذهبية لتسويق قروض السيارات (Auto Loans) بشكل مباشر.',
            'تقديم عروض الشباب والبطاقات الائتمانية في بيئة تفاعلية.',
            'استحواذ على شريحة عملاء جدد من فئة الشباب وملاك السيارات.'
          ]
        },
        auto: {
          title: 'لوكالات السيارات والشركات',
          points: [
            'عرض أحدث الموديلات أمام جمهور يقدر السيارات.',
            'بيع مباشر للإكسسوارات وخدمات التعديل والصيانة.',
            'بناء ولاء للعلامة التجارية مع فئة الشباب المؤثرين.'
          ]
        }
      },
      tiers: {
        title: 'باقات الرعاية والشراكة',
        items: [
          {
            name: 'الشريك الاستراتيجي (Exclusive)',
            focus: 'السيطرة الكاملة',
            details: 'تمنحكم حقوق الحصرية للقطاع، أكبر مساحة عرض، وتواجد في كافة الحملات الإعلانية للدول الخليجية.',
            investment: 'تواصل للمناقشة'
          },
          {
            name: 'راعي مشارك (Premium)',
            focus: 'تفاعل وانتشار',
            details: 'مساحة متميزة للتفاعل مع الجمهور، توزيع هدايا، وعرض المنتجات بشكل مباشر.',
            investment: 'تواصل للمناقشة'
          }
        ]
      },
      cta: {
        text: 'لا تفوتوا فرصة التواجد في أقوى أحداث 2026',
        button: 'تواصل معنا لحجز مساحتكم',
        email: 'info@bsmc.bh'
      }
    },
    en: {
      nav: {
        brand: 'AK AUTOSHOW',
        id: 'BAHRAIN-2026-GCC',
        confidential: 'Strategic Partnership Proposal'
      },
      hero: {
        label: 'Bahrain’s Largest Automotive Event | 2026',
        title: 'Access the Largest GCC Youth Gathering in One Place',
        subtitle: 'Over 5,000 visitors and 1,500+ participating cars from across the GCC. Your direct platform to reach youth and car enthusiasts effectively.',
        stats: [
          { value: '5,000+', label: 'Visitors & Attendees' },
          { value: '1,500+', label: 'Modified & Luxury Cars' },
          { value: 'GCC', label: 'Participants from all Gulf Countries' }
        ]
      },
      valueProp: {
        title: 'Why This Event?',
        items: [
          {
            header: 'Massive GCC Gathering',
            text: 'Drawing participants from KSA, Kuwait, UAE, Qatar, and Oman. Your brand won’t just speak to Bahrain, but to the entire Gulf market in one event.'
          },
          {
            header: 'Direct Access to Youth',
            text: 'The ultimate opportunity for Banks and Companies to be at the heart of youth gatherings, offering finance deals and opening direct channels with a generation seeking excellence.'
          },
          {
            header: 'High Intent Audience',
            text: 'Attendees are not just spectators; they are car owners and enthusiasts who spend generously on their passion, making them "Ideal Clients" for finance, insurance, and automotive sectors.'
          }
        ]
      },
      media: {
        title: 'Unrivaled Media Blitz',
        subtitle: 'A 360-degree marketing campaign ensuring your brand reaches every screen and home',
        items: [
          {
            head: 'Mega Influencers',
            desc: 'Hosting elite automotive & lifestyle influencers from across the GCC to broadcast the event to millions.'
          },
          {
            head: 'Press & Broadcast',
            desc: 'Official PR coverage via major newspapers, TV channels, and leading radio stations establishing credibility.'
          },
          {
            head: 'Digital Domination',
            desc: 'Aggressive paid ad campaigns precisely targeting relevant audiences across all social platforms.'
          }
        ]
      },
      vision: {
        title: 'Strategic Impact Beyond Marketing',
        items: [
          {
            head: 'National Vision Alignment',
            desc: 'Your partnership directly supports national tourism and attracts GCC spending power into the Kingdom.'
          },
          {
            head: 'Corporate Social Responsibility (CSR)',
            desc: 'Empowering Bahraini youth by providing a professional, safe platform for their talents is an investment in the future generation.'
          },
          {
            head: 'Elite Networking (B2B)',
            desc: 'Our VIP Lounge offers direct access to agency owners, investors, and decision-makers in the luxury sector.'
          }
        ]
      },
      sectorSpecific: {
        banks: {
          title: 'For Banking & Finance',
          points: [
            'Golden opportunity to market Auto Loans directly.',
            'Offer youth-centric products and credit cards in an interactive environment.',
            'Acquire a new segment of youth and car owner clients.'
          ]
        },
        auto: {
          title: 'For Car Dealerships & Companies',
          points: [
            'Showcase latest models to an audience that appreciates cars.',
            'Direct sales of accessories, tuning services, and maintenance.',
            'Build brand loyalty with influential youth demographics.'
          ]
        }
      },
      tiers: {
        title: 'Partnership Packages',
        items: [
          {
            name: 'Strategic Partner (Exclusive)',
            focus: 'Total Dominance',
            details: 'Grants category exclusivity, largest exhibition space, and presence in all GCC-wide ad campaigns.',
            investment: 'Contact to Discuss'
          },
          {
            name: 'Participating Sponsor (Premium)',
            focus: 'Engagement & Reach',
            details: 'Prime space for audience interaction, giveaways, and direct product showcasing.',
            investment: 'Contact to Discuss'
          }
        ]
      },
      cta: {
        text: 'Don’t Miss Being Part of 2026’s Big Event',
        button: 'Contact Us to Book Your Space',
        email: 'info@bsmc.bh'
      }
    }
  };

  const text = content[isRTL ? 'ar' : 'en'];

  // Enhanced "Dazzling" Dark Luxury Design
  return (
    <div className={`min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Cinematic Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[150px] animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-red-900/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 w-full z-50 px-6 py-5 flex justify-between items-center backdrop-blur-md bg-black/50 border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="w-2 h-10 bg-gradient-to-b from-red-600 to-red-900"></div>
           <div>
             <h1 className="text-xl font-black tracking-tighter text-white">{text.nav.brand}</h1>
             <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">{text.nav.id}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            {text.nav.confidential}
          </span>
          <button 
             onClick={() => {
                const newPath = isRTL ? '/en/proposal' : '/ar/proposal';
                window.location.href = newPath;
             }}
             className="text-xs font-bold text-gray-300 hover:text-white transition-colors uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white/10"
          >
             {isRTL ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* Massive Typographic Hero */}
        <section className="container mx-auto px-6 max-w-7xl min-h-[80vh] flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="mb-8 flex items-center gap-4"
          >
             <span className="h-px w-20 bg-gradient-to-r from-red-600 to-transparent"></span>
             <span className="text-red-500 uppercase tracking-[0.3em] text-sm font-bold glow-red">
               {text.hero.label}
             </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-8xl font-black text-white leading-[1.1] mb-12"
          >
            {isRTL ? (
              <>
                فرصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-300 to-white">الوصول</span><br/>
                لأكبر تجمع شبابي خليجي
              </>
            ) : (
              <>
                ACCESS <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-300 to-white">UNLIMITED</span><br/>
                GCC YOUTH POWER
              </>
            )}
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light border-l-2 border-white/10 pl-6"
            >
              {text.hero.subtitle}
            </motion.p>
            
            {/* Glass Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {text.hero.stats.map((stat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (idx * 0.1) }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-colors group"
                >
                  <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-red-500 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition - Dark Cards */}
        <section className="py-32 border-t border-white/5 bg-gradient-to-b from-[#050505] to-black">
          <div className="container mx-auto px-6 max-w-7xl">
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-600 mb-20 text-center md:text-right">
              / {text.valueProp.title}
            </h3>
            
            <div className="grid md:grid-cols-3 gap-12">
              {text.valueProp.items.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative group p-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-1 bg-gradient-to-r from-red-600 to-red-900 mb-8 max-w-[50px] group-hover:max-w-full transition-all duration-700 ease-out"></div>
                    <h4 className="text-2xl font-bold text-white mb-6 group-hover:text-red-400 transition-colors">{item.header}</h4>
                    <p className="text-gray-400 leading-loose text-sm font-light">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Coverage - Flashy Section */}
        <section className="py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="container mx-auto px-6 max-w-7xl relative z-10">
              <div className="text-center mb-20">
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">{text.media.title}</h3>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">{text.media.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 {text.media.items.map((m, idx) => (
                   <motion.div 
                     key={idx}
                     whileHover={{ y: -5 }}
                     className="bg-black border-l-2 border-white/10 p-8 hover:border-red-600 transition-colors group"
                   >
                      <div className="text-xs font-bold text-red-600 mb-4 tracking-widest uppercase">/ 0{idx + 1}</div>
                      <h4 className="text-xl font-bold text-white mb-4">{m.head}</h4>
                      <p className="text-gray-400 leading-relaxed text-sm">{m.desc}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* Strategic Vision - Corporate Aesthetic */}
        <section className="py-32 bg-[#fff] text-black">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-black/10 pb-8">
               <h3 className="text-4xl font-black tracking-tight max-w-xl">
                 {text.vision.title}
               </h3>
               <div className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-4 md:mt-0">
                  Corporate Alignment
               </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {text.vision.items.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <h4 className="text-xl font-bold">{item.head}</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed pl-12 border-l border-gray-200 group-hover:border-black transition-colors">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sector Focus - Split Screen Aesthetic */}
        <section className="py-32 container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Banks Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#0a0a0a] border border-white/10 p-12 hover:border-red-500/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-900/10 rounded-full blur-[80px]"></div>
              <h4 className="text-3xl font-black text-white mb-10 border-b border-white/10 pb-6 relative z-10">
                {text.sectorSpecific.banks.title}
              </h4>
              <ul className="space-y-8 relative z-10">
                {text.sectorSpecific.banks.points.map((pt, i) => (
                   <li key={i} className="flex gap-6 items-start">
                     <span className="text-blue-500 font-black text-lg mt-1">0{i+1}</span>
                     <span className="text-gray-300 font-light text-lg">{pt}</span>
                   </li>
                ))}
              </ul>
            </motion.div>

            {/* Automotive Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#0a0a0a] border border-white/10 p-12 hover:border-red-500/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-900/10 rounded-full blur-[80px]"></div>
              <h4 className="text-3xl font-black text-white mb-10 border-b border-white/10 pb-6 relative z-10">
                {text.sectorSpecific.auto.title}
              </h4>
              <ul className="space-y-8 relative z-10">
                {text.sectorSpecific.auto.points.map((pt, i) => (
                   <li key={i} className="flex gap-6 items-start">
                     <span className="text-red-500 font-black text-lg mt-1">0{i+1}</span>
                     <span className="text-gray-300 font-light text-lg">{pt}</span>
                   </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Packages - Premium Grid */}
        <section className="bg-black py-32 border-t border-white/10">
           <div className="container mx-auto px-6 max-w-7xl">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-20 text-center tracking-tighter">
                 {text.tiers.title}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {text.tiers.items.map((tier, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className={`p-10 border transition-all duration-500 ${idx === 0 ? 'bg-gradient-to-br from-[#111] to-[#050505] border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.1)]' : 'bg-[#080808] border-white/5'}`}
                  >
                     <div className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 ${idx === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                       {tier.focus}
                     </div>
                     <h4 className="text-3xl md:text-4xl font-bold text-white mb-6">{tier.name}</h4>
                     <p className="text-gray-400 mb-10 leading-relaxed min-h-[80px] text-lg font-light">
                       {tier.details}
                     </p>
                     <div className="flex items-center justify-between border-t border-white/10 pt-6">
                        <span className="text-sm font-mono text-gray-500">INVESTMENT</span>
                        <span className="text-white font-bold text-lg">{tier.investment}</span>
                     </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </section>

        {/* Final CTA - Minimalist & Bold */}
        <section className="py-40 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent opacity-50"></div>
          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tight">
              {text.cta.text}
            </h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/97338409977" 
                className="bg-white text-black px-12 py-5 font-bold text-sm uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors w-full md:w-auto shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                {text.cta.button}
              </motion.a>
              <a href={`mailto:${text.cta.email}`} className="text-gray-400 hover:text-white transition-colors border-b border-gray-600 hover:border-white pb-1 text-sm tracking-widest uppercase">
                {text.cta.email}
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Floating Action Button for PDF/Print */}
      <motion.button
         whileHover={{ scale: 1.1 }}
         onClick={() => window.print()}
         className="fixed bottom-8 right-8 z-50 bg-white text-black p-4 rounded-full border-2 border-transparent hover:border-red-600 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-2 group"
         title="Download as PDF"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:bg-clip-text group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="font-bold pr-2 hidden md:inline group-hover:text-red-600">PDF</span>
      </motion.button>

    </div>
  );
}
