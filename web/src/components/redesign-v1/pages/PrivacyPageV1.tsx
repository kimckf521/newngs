import type { Locale } from '@/i18n/types';
import {
  PageHero,
  Section,
  Prose,
  GradientText,
} from '../ui';

/* ------------------------------------------------------------------ *
 * /privacy — Privacy policy (legal long-form). Faithful port of the
 * legacy PrivacyPolicyZh / PrivacyPolicyEn sections, re-expressed in the
 * bold dark v1 design. Hero + a single Prose section. No contact form.
 * ------------------------------------------------------------------ */

const CONTACT_EMAIL = 'admission@nextgenscholars.asia';

type Clause = { heading: string; body: React.ReactNode };

const content: Record<Locale, {
  hero: { eyebrow: string; title: React.ReactNode; lead: string };
  effective: string;
  clauses: Clause[];
}> = {
  en: {
    hero: {
      eyebrow: 'Legal',
      title: (
        <>
          Privacy <GradientText>Policy</GradientText>
        </>
      ),
      lead:
        'How NextGen Scholars collects, uses, and protects the information you share with us.',
    },
    effective: 'Effective date: 1 May 2015',
    clauses: [
      {
        heading: '1. Information We Collect',
        body: (
          <p>
            We collect personal information (e.g., name, email address) that you provide to us, and
            technical information (e.g., IP address, browser type) automatically when you use our site.
          </p>
        ),
      },
      {
        heading: '2. How We Use Your Information',
        body: (
          <p>
            We use your information to provide and improve our services, communicate with you, and send
            you updates or promotional content if you opt in.
          </p>
        ),
      },
      {
        heading: '3. Sharing of Information',
        body: (
          <p>
            We do not sell or trade your information. We may share it with trusted partners who help us
            operate our services, and disclose it if required by law.
          </p>
        ),
      },
      {
        heading: '4. Data Security',
        body: (
          <p>
            We implement technical and organizational measures to secure your personal information from
            unauthorized access.
          </p>
        ),
      },
      {
        heading: '5. Your Rights',
        body: (
          <p>
            You can access, correct, or delete your personal data. You may also opt out of marketing
            communications at any time.
          </p>
        ),
      },
      {
        heading: '6. Third-Party Links',
        body: (
          <p>
            Our website may contain links to other websites. We are not responsible for their privacy
            practices.
          </p>
        ),
      },
      {
        heading: '7. Changes to This Policy',
        body: (
          <p>
            We may update this Privacy Policy and will notify you of any changes by updating this page.
          </p>
        ),
      },
      {
        heading: '8. Contact Us',
        body: (
          <p>
            If you have any questions, please contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        ),
      },
    ],
  },
  zh: {
    hero: {
      eyebrow: '法律条款',
      title: (
        <>
          隐私<GradientText>政策</GradientText>
        </>
      ),
      lead: 'NextGen Scholars 如何收集、使用并保护您与我们分享的信息。',
    },
    effective: '生效日期：2015 年 5 月 1 日',
    clauses: [
      {
        heading: '1. 我们收集的信息',
        body: (
          <p>
            我们会收集您主动提供的个人信息（例如：姓名、电子邮箱地址），以及您使用我们网站时自动收集的技术信息（例如：IP 地址、浏览器类型）。
          </p>
        ),
      },
      {
        heading: '2. 我们如何使用您的信息',
        body: (
          <p>
            我们使用您的信息来提供和改进我们的服务，与您进行沟通，并在您选择订阅的情况下向您发送更新或推广内容。
          </p>
        ),
      },
      {
        heading: '3. 信息的共享',
        body: (
          <p>
            我们不会出售或交换您的信息。我们可能会与值得信赖的合作伙伴共享信息，以帮助我们运营服务，或在法律要求的情况下披露您的信息。
          </p>
        ),
      },
      {
        heading: '4. 数据安全',
        body: <p>我们采取技术和管理措施，以防止您的个人信息被未经授权访问或泄露。</p>,
      },
      {
        heading: '5. 您的权利',
        body: <p>您有权访问、更正或删除您的个人数据，也可以随时选择退出接收我们的营销通讯。</p>,
      },
      {
        heading: '6. 第三方链接',
        body: <p>我们的网站可能包含指向其他网站的链接，我们不对这些网站的隐私做法负责。</p>,
      },
      {
        heading: '7. 政策的变更',
        body: <p>我们可能会不时更新本隐私政策，并会通过更新本页面的方式通知您变更。</p>,
      },
      {
        heading: '8. 联系我们',
        body: (
          <p>
            如您有任何问题，请通过以下方式联系我们：{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        ),
      },
    ],
  },
};

export function PrivacyPageV1({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <>
      <PageHero eyebrow={t.hero.eyebrow} title={t.hero.title} lead={t.hero.lead} align="left" />

      <Section tone="night-800" glow="violet" glowPosition="right">
        <Prose>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-white/45">
            {t.effective}
          </p>
          {t.clauses.map((clause) => (
            <div key={clause.heading}>
              <h2>{clause.heading}</h2>
              {clause.body}
            </div>
          ))}
        </Prose>
      </Section>
    </>
  );
}
