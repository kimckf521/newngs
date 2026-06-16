import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/types';
import { PageHero, Section, GradientText, Prose } from '../ui';

/* ------------------------------------------------------------------ *
 * /termsofservice — Terms of Service (legal long-form).
 * Faithful port of the legacy TermsOfServiceZh / TermsOfServiceEn
 * sections, re-expressed in the bold dark v1 design as a single
 * <Prose> block inside one <Section>, after a simple <PageHero>.
 * ------------------------------------------------------------------ */

/** A clause is either a plain string or a string with an ordered sub-list. */
type Clause = ReactNode | { lead: ReactNode; sub: ReactNode[] };
type Block = { heading: string; intro?: ReactNode; clauses: Clause[] };

function isNested(c: Clause): c is { lead: ReactNode; sub: ReactNode[] } {
  return typeof c === 'object' && c !== null && 'sub' in (c as Record<string, unknown>);
}

const content: Record<Locale, {
  hero: { eyebrow: string; title: ReactNode; lead: string };
  tocLabel: string;
  toc: string[];
  blocks: Block[];
}> = {
  en: {
    hero: {
      eyebrow: 'Legal',
      title: (
        <>
          Terms of <GradientText>Service</GradientText>
        </>
      ),
      lead:
        'Both parties, under the principles of voluntariness, equality, and good faith, engage NextGenScholars to provide online teaching services.',
    },
    tocLabel: 'Contents',
    toc: [
      'Fees and Payment',
      'Client Rights and Obligations',
      'NGS Rights and Obligations',
      'Refund Policy',
      'Breach of Contract',
      'Effectiveness and Miscellaneous',
    ],
    blocks: [
      {
        heading: 'Fees and Payment',
        clauses: [
          `Service fees are based on the course package purchased on the nextgenscholars.asia website (hereinafter “NGS”). The client’s contact identity is the email address provided at the time of payment.`,
        ],
      },
      {
        heading: 'Client Rights and Obligations',
        clauses: [
          'The client and student are entitled to receive the corresponding courses and supporting services according to this agreement and the mutually agreed schedule.',
          'The client and student may supervise NGS’s services and provide suggestions and feedback.',
          'The client shall pay all service fees as stipulated herein; if payment is not made as agreed, NGS may refuse to provide services.',
          'The client and student warrant that the personal information submitted is true, complete, and valid; any changes must be notified to NGS no later than three (3) days before the change takes effect.',
          <>
            Within the first <strong>3 class hours</strong> from the course start date, the client may request a one-time tutor change with NGS; thereafter, the agreement shall be performed as agreed, or NGS may arrange the student into another class of the same level with vacancies, as mutually agreed by both parties.
          </>,
          'The student shall attend classes according to the confirmed schedule, check in each session, pay attention in class, and complete homework and tasks on time.',
          'The client and student shall properly keep their learning account and password. NGS is not responsible for any disclosure of personal information caused by password sharing or disclosure to third parties.',
          'The client and student shall not request any conduct that violates academic integrity from NGS or its staff.',
          'The client and student shall keep strictly confidential the contents of this agreement and any NGS intellectual property, service content, data, course materials, reports, other documents, and the personal information of NGS personnel obtained during the services.',
        ],
      },
      {
        heading: 'NGS Rights and Obligations',
        clauses: [
          'NGS shall perform the services under this agreement on time, with due quality, diligence, and responsibility.',
          'NGS shall properly safeguard the personal information and materials provided by the client and use, disclose, or process such information in accordance with applicable laws and solely for the purposes of this agreement.',
          'NGS will confirm the tutoring plan and schedule with the student via email and deliver services accordingly. If a schedule adjustment is required, both parties shall confirm the new schedule via email at least 24 hours before the original class time.',
          'During service delivery, NGS will consider reasonable opinions and suggestions and make adjustments or improvements as appropriate.',
          'To ensure service quality, NGS’s quality control team may conduct periodic phone or email follow-ups.',
          'All intellectual property and other rights in the tutoring courses belong exclusively to NGS. Without prior authorization, the client shall not copy, record, share, monetize, or otherwise engage in activities that infringe relevant IP laws with respect to any resources, including online courses, electronic materials, classroom handouts, etc.',
          'NGS shall not be liable for any personal or financial loss, damage, or injury not caused by NGS’s intentional conduct.',
        ],
      },
      {
        heading: 'Refund Policy',
        clauses: [
          'If, before the course begins, the client requests a refund or termination of this agreement (other than circumstances already provided herein), the client is entitled to a full refund. NGS shall process the refund to the original payment method within 15 business days upon receipt of the client’s written request, after which this agreement terminates.',
          <>
            If, after the first session and before the second session begins, the client is dissatisfied with the course and does not accept a tutor change, the client is entitled to a refund of all remaining class fees after deducting the first session at the trial price of <strong>299 RMB</strong>. NGS shall refund to the original payment method within 15 business days upon receipt of the client’s written request, after which this agreement terminates.
          </>,
          'Participation in the second session is deemed acceptance of the service quality; thereafter, during the service period, the client may request a change of tutor or service personnel.',
          {
            lead: <>For refund or termination requests <em>after</em> the second session (other than circumstances already provided herein):</>,
            sub: [
              <>If attended class hours are <strong>≥ 50%</strong> of the contracted hours, fees will be calculated at the <strong>discounted unit price</strong> under this agreement; the actual incurred class fees will be deducted and the balance refunded.</>,
              `If attended class hours are < 50% of the contracted hours, fees will be calculated at the original unit price of 900 RMB/hour; the actual incurred class fees will be deducted and the balance refunded.`,
              'NGS will refund to the original payment method within 15 business days after receiving the client’s formal refund or termination request; once refunded, this agreement terminates.',
              <>If an invoice has been issued prior to the refund, the client must return the invoice for reversal; if unable to return it, NGS will deduct <strong>8%</strong> of the invoice amount from the total refund.</>,
            ],
          },
          'The maximum refund is limited to the service fees actually paid by the client (excluding interest). NGS may deduct reasonable taxes/fees incurred in the transaction and any third-party fees already paid (e.g., learning account usage fees).',
        ],
      },
      {
        heading: 'Breach of Contract',
        clauses: [
          'Both parties shall strictly perform all terms of the contract. If the performance of this contract becomes impossible due to breach by either party, the non-breaching party may terminate the contract and claim corresponding liabilities for breach.',
          {
            lead: 'Client breach:',
            sub: [
              'If the client violates the confidentiality obligations and discloses NGS’s IP, data, or other materials to any third party, NGS may terminate this agreement, retain fees already received, and claim damages.',
              'If, without prior notice to NGS, the client becomes unreachable through the agreed contact method, resulting in a failure to adjust class time in a timely manner, the affected class hours shall be deemed as delivered.',
            ],
          },
          {
            lead: 'NGS breach:',
            sub: [
              'If NGS discloses student personal information to non-affiliated third parties in violation of this agreement, the client may terminate this agreement and request a refund in accordance with the Refund Policy.',
              'If NGS fails to provide services with the agreed quality and quantity, the client may terminate this agreement and request a refund in accordance with the Refund Policy.',
            ],
          },
        ],
      },
      {
        heading: 'Effectiveness and Miscellaneous',
        clauses: [
          <>This agreement takes effect upon the client’s payment; class hour validity is <strong>365 days</strong>.</>,
          'This agreement constitutes the entire agreement between the parties regarding its subject matter and supersedes all prior consultations and agreements.',
          'Any disputes arising from or in connection with the performance of this agreement shall first be resolved through consultation; failing which, both parties agree to submit the dispute to the People’s Court at the service provider’s domicile.',
          'Unless expressly stated otherwise in writing, the email addresses agreed in this contract serve as the service addresses for communications, including in the event of disputes or litigation.',
          'This electronic agreement is made in duplicate; each party holds one copy with the same legal effect.',
        ],
      },
    ],
  },
  zh: {
    hero: {
      eyebrow: '法律条款',
      title: (
        <>
          服务<GradientText>协议</GradientText>
        </>
      ),
      lead: '双方本着自愿、平等、诚信的原则，委托 NextGenScholars 提供线上教学服务。',
    },
    tocLabel: '目录',
    toc: [
      '服务费用和付款方式',
      '委托人权利义务',
      'NGS 的权利与义务',
      '退费政策',
      '违约责任',
      '生效及其他',
    ],
    blocks: [
      {
        heading: '服务费用和付款方式',
        clauses: [
          `服务费用以委托人在 nextgenscholars.asia 网站（以下简称 “NGS”）选购的课程包为准。委托人身份联系方式以付款时留下的邮箱地址为准。`,
        ],
      },
      {
        heading: '委托人权利义务',
        clauses: [
          '委托人及学员有权根据本合同及双方约定的时间表获得相应课程及配套服务。',
          '委托人及学员有权对 NGS 的服务进行监督和提出建议反馈。',
          '委托人应按本协议规定向受托人支付全部的服务费用；未按约支付的，受托人有权拒绝提供服务。',
          '委托人及学员承诺提交的个人信息真实、完整、有效；如有变更，须在变更之日前三日内通知受托人。',
          '自开课之日起【3】个课时内，委托人有权向 NGS 提出一次性更换导师；此后须完成本协议约定；或由 NGS 将学员安排进入相同级别未满员班级，具体情况双方协商。',
          '学员应按双方确认的时间表上课，做好签到、认真听讲并按时完成课后作业和任务。',
          '委托人及学员须妥善保管个人学习账户及密码；因密码泄露或与他人共享导致的资料泄露，NGS 不承担责任。',
          '委托人及学员不得向 NGS 及其服务人员提出违反学术诚信的要求。',
          '委托人及学员应对本协议内容、知识产权、服务内容、数据、课程资料、报告、其他文件及 NGS 服务人员个人信息等严格保密。',
        ],
      },
      {
        heading: 'NGS 的权利与义务',
        clauses: [
          'NGS 按时、按质、勤勉、尽责地履行本协议约定服务。',
          '对委托人提供的个人信息及资料妥善保管并依法合规使用、披露或处理。',
          '通过电子邮件与学员确认辅导计划与时间表并执行；如需调整，双方应在约定上课时间 24 小时或以上，通过电子邮件确认新的时间表。',
          '服务过程中听取合理意见与建议，并据实调整或改善。',
          '为保证质量，品控部门将定期进行电话及邮件回访。',
          '辅导课程的知识产权及其他权益归 NGS 所有。未经授权，不得复制、翻录、共享、牟利或从事其他侵权活动。',
          '服务期间，非 NGS 主观意图造成的任何人身或财务损失、损害或伤害，NGS 不承担相关责任。',
        ],
      },
      {
        heading: '退费政策',
        clauses: [
          '课程开始前提出退费或解约的，委托人有权要求全额退费；NGS 在收到书面申请后 15 个工作日内原路径退款，退款完成后协议终止。',
          <>第一节课结束、第二节课开始前不满意且不接受更换导师的，扣除首节课（按试听价 <strong>299 元</strong>）后退回剩余全部课时费用；NGS 在收到书面申请后 15 个工作日内原路径退款，退款完成后协议终止。</>,
          '参与第二节课程视为对该课程服务满意；此后服务期间，委托人有权要求更换导师或服务人员。',
          {
            lead: '第二节课开始后退费或解约的：',
            sub: [
              <>已上课时 <strong>≥ 约定课时的 50%（含）</strong>时，按本协议约定的优惠课单价计费，扣除实际发生课时费后退回剩余费用。</>,
              `已上课时 < 50% 时，按课程原单价（900 元/小时）计费，扣除实际发生课时费后退回剩余费用。`,
              'NGS 在委托人正式提出退费或解约申请后 15 个工作日内原路径退款，退款完成后协议终止。',
              <>如已开具发票，委托人须退回发票以冲红；无法退回的，NGS 将在退款总额基础上扣除发票金额 <strong>8%</strong> 的税费。</>,
            ],
          },
          '退费上限为委托人已支付的服务费（不含利息）；NGS 有权扣除交易合理税费及向第三方已缴费用（如学习账户使用费等）。',
        ],
      },
      {
        heading: '违约责任',
        clauses: [
          '任一方违约导致合同无法继续履行的，守约方有权解除并要求违约方承担相应责任。',
          {
            lead: '委托人违约：',
            sub: [
              '违反保密约定泄露 NGS 知识产权、数据或资料的，NGS 有权解除协议且已收取费用不予退还，并可主张损失赔偿。',
              '未提前告知且通过约定方式无法联系，致使未能及时修改上课时间的，相关课时视为实际发生。',
            ],
          },
          {
            lead: 'NGS 违约：',
            sub: [
              '违反约定向非关联第三方泄露学员个人信息的，委托人有权解除并主张退费，按退费政策执行。',
              '未能按质按量提供服务的，委托人有权解除并主张退费，按退费政策执行。',
            ],
          },
        ],
      },
      {
        heading: '生效及其他',
        clauses: [
          <>本协议于委托人付款时成立生效；课时有效期为 <strong>365 天</strong>。</>,
          '本协议构成双方就本标的达成的全部协议，并取代此前所有磋商或协议。',
          '因履行本协议发生争议的，应先协商；不成时，双方一致同意向受托人住所地人民法院提起诉讼。',
          '除特别书面声明外，本合同所约定的电子邮件为双方通讯送达地址，并适用于争议或诉讼。',
          '本电子协议一式两份，双方各执一份，具有同等法律效力。',
        ],
      },
    ],
  },
};

export function TermsPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <>
      <PageHero eyebrow={t.hero.eyebrow} title={t.hero.title} lead={t.hero.lead} align="left" />

      <Section tone="night-800" glow="violet" glowPosition="right">
        <Prose>
          <nav aria-label={t.tocLabel}>
            <h2>{t.tocLabel}</h2>
            <ol>
              {t.toc.map((item, i) => (
                <li key={i}>
                  <a href={`#terms-${i + 1}`}>{item}</a>
                </li>
              ))}
            </ol>
          </nav>

          {t.blocks.map((block, bi) => (
            <section key={bi} id={`terms-${bi + 1}`} className="scroll-mt-28">
              <h2>{block.heading}</h2>
              {block.intro && <p>{block.intro}</p>}
              {block.clauses.length === 1 && !isNested(block.clauses[0]) ? (
                <p>{block.clauses[0] as ReactNode}</p>
              ) : (
                <ul>
                  {block.clauses.map((clause, ci) =>
                    isNested(clause) ? (
                      <li key={ci}>
                        {clause.lead}
                        <ol>
                          {clause.sub.map((s, si) => (
                            <li key={si}>{s}</li>
                          ))}
                        </ol>
                      </li>
                    ) : (
                      <li key={ci}>{clause}</li>
                    ),
                  )}
                </ul>
              )}
            </section>
          ))}
        </Prose>
      </Section>
    </>
  );
}
