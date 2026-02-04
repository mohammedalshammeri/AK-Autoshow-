import ProposalClient from '@/components/ProposalClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Proposal' });
  
  return {
    title: locale === 'ar' ? 'ملف الشراكة الاستراتيجية | 2026' : 'Strategic Partnership Proposal | 2026',
    description: locale === 'ar' 
      ? 'العرض الرسمي للرعاة والشركاء الاستراتيجيين - معرض البحرين للسيارات 2026'
      : 'Official Partnership Proposal - Bahrain Car Show 2026',
  };
}

export default function ProposalPage() {
  return <ProposalClient />;
}
