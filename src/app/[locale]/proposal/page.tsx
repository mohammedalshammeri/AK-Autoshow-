import type { Metadata } from 'next';
import ProposalClient from '@/components/ProposalClient';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  props: Props
): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  
  return {
    title: locale === 'ar' ? 'ملف الشراكة الاستراتيجية | 2026' : 'Strategic Partnership Proposal | 2026',
    description: locale === 'ar' 
      ? 'العرض الرسمي للرعاة والشركاء الاستراتيجيين - معرض البحرين للسيارات 2026'
      : 'Official Partnership Proposal - Bahrain Car Show 2026',
  };
}

export default async function ProposalPage(props: Props) {
  const params = await props.params;
  return <ProposalClient />;
}

