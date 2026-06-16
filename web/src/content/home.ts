import type { Localized } from '@/i18n/types';
import { siteLinks } from '@/lib/siteLinks';

export interface HomeStrings {
  partnerIntro: {
    title: React.ReactNode;
    description: string;
  };
  ourPrograms: {
    title: string;
    cards: {
      key: string;
      href: string;
      img: string;
      title: string;
      description: string;
    }[];
  };
  inspires: {
    title: string;
    cards: { img: string; title: string; description: string }[];
  };
}

export const home: Localized<HomeStrings> = {
  zh: {
    partnerIntro: {
      title: '携手NGS未来学者',
      description: 'NextGen期待与贵校携手-不负众望，同启未来！',
    },
    ourPrograms: {
      title: '未来教育联盟',
      cards: [
        {
          key: 'partner',
          href: '#founder_zh',
          img: '/static/img/partnerwithus.jpg',
          title: '成为NGS伙伴',
          description:
            '我们提供专业的线上国际课程、升学辅导以及个性化家教服务，旨在帮助教育者与学生实现学术卓越，释放他们的全部潜能。',
        },
        {
          key: 'study',
          href: '#our-programs',
          img: '/static/img/Studywithus.png',
          title: '成为NGS学生',
          description:
            '或许你梦想进入理想的大学，但不确定如何实现。我们的个性化辅导服务将全程为你指引方向。',
        },
        {
          key: 'join',
          href: siteLinks.zh.ngsInspires,
          img: '/static/img/Joinus.jpg',
          title: '加入NGS全球社区',
          description:
            '在 NextGen Scholars，连接全球产业领袖、全球大学与全球学习者！',
        },
      ],
    },
    inspires: {
      title: 'NextGen Inspires',
      cards: [
        {
          img: '/static/img/globalindustry.jpg',
          title: '全球行业领袖',
          description:
            'NGS与各行业创新与卓越的前沿领袖深度链接。通过邀请行业专家领袖作为线上研讨会主讲嘉宾、导师计划和职业发展工作坊，学生可以深入了解新兴趋势、职业发展路径，以及在竞争激烈的全球市场中取得成功所需的实际知识技能。',
        },
        {
          img: '/static/img/globaluniversities.png',
          title: '全球高校直连',
          description:
            'NGS与世界知名大学建立长期合作联系，为学生提供独家升学指导、学校专业介绍、校园参观以及众多交流拓展机会，助力他们迈向更广阔的未来。',
        },
        {
          img: '/static/img/sparklab.jpg',
          title: 'SPARK LAB',
          description:
            'SPARK LAB 是一个全球同龄学子的互动平台，连接世界各地的中学生，鼓励他们协作、创新与创作。通过构建一个全球青少年思想交流的网络，SPARK LAB 激发学生大胆思考，培养全球视野，并引导他们在塑造未来中发挥领导作用。',
        },
        {
          img: '/static/img/globalalumni.png',
          title: '全球校友',
          description:
            '一个充满活力的跨国校友网络，这些校友已成功实现他们的学术和职业目标。该平台为学生提供向曾走过类似道路的校友学习的机会，提供导师支持、指导建议和灵感启发。',
        },
      ],
    },
  },
  en: {
    partnerIntro: {
      title: 'PARTNER WITH NEXTGEN SCHOLARS',
      description:
        'We look forward to working with you to unlock the full potential of your students and open gates to global university and career resources.',
    },
    ourPrograms: {
      title: 'Our Programs',
      cards: [
        {
          key: 'partner',
          href: '#founder',
          img: '/static/img/partnerwithus.jpg',
          title: 'Partner With Us',
          description:
            'We offer expert online international programs, admissions coaching, and personalized tutoring services designed to empower educators and students to achieve academic excellence and unlock their full potential.',
        },
        {
          key: 'study',
          href: '#our-programs',
          img: '/static/img/Studywithus.png',
          title: 'Study With Us',
          description:
            "Perhaps you're dreaming of gaining admission to your dream university but unsure how to get there. Our personalized mentoring services are here to guide you every step of the way.",
        },
        {
          key: 'join',
          href: siteLinks.en.ngsInspires,
          img: '/static/img/Joinus.jpg',
          title: 'Join Us',
          description:
            'Connect global industry leaders, global universities, and global learners at NextGen Scholars!',
        },
      ],
    },
    inspires: {
      title: 'NextGen Inspires',
      cards: [
        {
          img: '/static/img/globalindustry.jpg',
          title: 'Global Industry Leaders',
          description:
            'Connect with leaders at the forefront of innovation and excellence across diverse industries. Through expert-led webinars, mentorship programs, and career-focused workshops, students gain first-hand insights into emerging trends, career pathways, and the real-world skills required to succeed in a competitive global market.',
        },
        {
          img: '/static/img/globaluniversities.png',
          title: 'Global Universities',
          description:
            'Explore partnerships with renowned universities worldwide, offering students exclusive access to admissions guidance, campus tours, and networking opportunities.',
        },
        {
          img: '/static/img/sparklab.jpg',
          title: 'SPARK LAB',
          description:
            'The SPARK LAB is an interactive platform connecting Global K-12 students to collaborate, innovate, and create. By fostering a global network of young minds, the SPARK LAB inspires students to think boldly, develop a global perspective, and take the lead in shaping the future.',
        },
        {
          img: '/static/img/globalalumni.png',
          title: 'Global Alumni',
          description:
            'Leverage a thriving network of international alumni who have successfully pursued their academic and professional goals. This domain offers students opportunities to learn from the experiences of those who have walked similar paths, providing mentorship, guidance, and inspiration.',
        },
      ],
    },
  },
};
