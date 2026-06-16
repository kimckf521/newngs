import type { Localized } from '@/i18n/types';

export interface FounderStoryStrings {
  anchorId: string;
  title: string;
  founders: { name: string; img: string }[];
  paragraphs: string[];
}

const founders = [
  { name: 'Valerie Zhou', img: '/static/img/founders/HailanReal.jpg' },
  { name: 'Paul Chiu', img: '/static/img/founders/PaulReal.jpg' },
  { name: 'Scarlett Sampson', img: '/static/img/founders/WeixinReal.png' },
  { name: 'Nancy Wu', img: '/static/img/founders/NancyReal.jpeg' },
];

export const founderStory: Localized<FounderStoryStrings> = {
  zh: {
    anchorId: 'founder_zh',
    title: '创始人故事',
    founders,
    paragraphs: [
      'NextGen Scholars 是一个具有前瞻性的组织，致力于通过为教育者和学生提供成功所需的工具与支持，来推动教育转型，以适应快速发展的全球化世界。',
      '总部位于全球关键城市——旧金山、墨尔本、中国香港、台湾省以及大湾区——NextGen Scholars 由一群充满热情的教育者、科技领袖和行业专家共同创立，他们怀抱着重新定义未来教育的愿景。',
      '我们的创始团队拥有数十年在科技、商业、创意艺术、STEM 和全球教育领域的专业经验，致力于帮助教育者和学生在瞬息万变的世界中取得成功与成长。',
      '通过与全球产业领袖、教育者和学生的紧密联系，我们的目标是建立一个协作且互助的社区，让下一代具备知识、技能与自信，在快速发展的时代中蓬勃成长。',
    ],
  },
  en: {
    anchorId: 'founder',
    title: 'Founder Story',
    founders,
    paragraphs: [
      'NextGen Scholars is a forward-thinking organization dedicated to transforming education by equipping both educators and students with the tools and support needed for success in a rapidly evolving, globalized world.',
      'Based in key cities around the globe—San Francisco, Melbourne, Hong Kong, Taiwan, and the Greater Bay Area of China—NextGen Scholars was founded by a passionate group of educators, tech leaders, and industry professionals who share a vision to redefine education for the future.',
      'Our founders bring decades of expertise in technology, business, creative arts, STEM and global education, empowering educators and students alike to succeed and thrive in an ever-changing world.',
      'By reaching out to global industry leaders, educators and students worldwide, we aim to create a collaborative and supportive community that equips the next generation with the knowledge, skills, and confidence to thrive in a rapidly evolving world.',
    ],
  },
};
