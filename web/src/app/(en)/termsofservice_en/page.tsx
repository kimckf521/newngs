import { TermsPageV1 } from '@/components/redesign-v1/pages/TermsPageV1';

export const metadata = {
  title: 'Terms of Service — NextGen Scholars',
  description: 'NextGen Scholars online teaching service terms: fees and payment, refund policy, the rights and obligations of both parties, and breach of contract.',
};

export default function Page() {
  return <TermsPageV1 locale="en" />;
}
