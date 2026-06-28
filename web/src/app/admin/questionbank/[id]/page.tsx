import { QuestionBankPage } from '@/components/admin/console/QuestionBankPage';

/** Full-page question-bank detail. `id` is the bank id (e.g. 'ielts').
 *  Reached by clicking a bank card in /admin → 题库. */
export default function AdminQuestionBankRoute({ params }: { params: { id: string } }) {
  return <QuestionBankPage id={params.id} locale="zh" />;
}
