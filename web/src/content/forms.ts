import type { Localized } from '@/i18n/types';

export interface IndexFormStrings {
  heading: string;
  fields: {
    name: string;
    school: string;
    email: string;
    contact: string;
    inquiry: string;
  };
  placeholders: {
    name: string;
    school: string;
    email: string;
    contact: string;
    inquiry: string;
  };
  submit: string;
  submitting: string;
  successMsg: string;
  errorMsgFallback: string;
  networkErrorMsg: string;
  imageAlt: string;
}

export const indexForm: Localized<IndexFormStrings> = {
  zh: {
    heading: '想要与 NGS 合作',
    fields: {
      name: '姓名',
      school: '学校 / 机构',
      email: '邮箱',
      contact: '手机 / 微信',
      inquiry: '咨询内容',
    },
    placeholders: {
      name: '请输入您的姓名',
      school: '学校 / 机构名称',
      email: 'you@example.com',
      contact: '+61 … / 您的微信号',
      inquiry: '请简单描述您的目标…',
    },
    submit: '提交',
    submitting: '提交中…',
    successMsg: '感谢您的咨询！我们将尽快与您联系。',
    errorMsgFallback: '提交失败，请稍后再试。',
    networkErrorMsg: '网络错误，请稍后再试。',
    imageAlt: '线上会议',
  },
  en: {
    heading: 'Looking to Partner with NGS',
    fields: {
      name: 'Name',
      school: 'School',
      email: 'Email',
      contact: 'Mobile / WeChat',
      inquiry: 'Inquiries',
    },
    placeholders: {
      name: 'Your name',
      school: 'School / Organization',
      email: 'you@example.com',
      contact: '+61 … / your WeChat ID',
      inquiry: 'Tell us a bit about your goals…',
    },
    submit: 'Send',
    submitting: 'Sending…',
    successMsg: 'Thanks! We will contact you shortly.',
    errorMsgFallback: 'Unable to send. Please try again.',
    networkErrorMsg: 'Network error. Please try again.',
    imageAlt: 'Online meeting',
  },
};
