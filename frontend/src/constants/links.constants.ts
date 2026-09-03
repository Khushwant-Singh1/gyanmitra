import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  // faFolder,
  faMessage,
  faNewspaper,
  faNoteSticky,
} from '@fortawesome/free-regular-svg-icons';
import {
  faCodePullRequest,
  faHome,
  faTags,
  faUsers,
  faTrophy, // 🏆 Competition icon added
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { USER_ROLE } from './index.constants';

export interface ILinksWithName {
  link: string;
  name: string;
}

export const GET_HELP_LINKS: ILinksWithName[] = [
  { name: 'About Us', link: '/about-us' },
  { name: 'Contact & FAQ', link: '/contact-us' },
  { name: 'Competitions', link: '/competitions' },
];

export const LEGAL_LINKS: ILinksWithName[] = [
  { name: 'Privacy Policy', link: '/privacy-policy' },
  { name: 'Terms & Conditions', link: '/terms-and-conditions' },
  { name: 'Disclaimer', link: '/disclaimer' },
];

export const ADMINISTRATOR_SIDEBAR: {
  title: string;
  url: string;
  icon: IconDefinition;
  access: USER_ROLE[];
}[] = [
  {
    title: 'Home',
    url: '/administrator',
    icon: faHome,
    access: [USER_ROLE.Admin, USER_ROLE.Owner],
  },
  {
    title: 'Articles',
    url: '/administrator/articles',
    icon: faNewspaper,
    access: [USER_ROLE.Admin, USER_ROLE.Owner],
  },
  {
    title: 'Scheduled',
    url: '/administrator/articles-scheduled',
    icon: faClock,
    access: [
      USER_ROLE.Admin,
      USER_ROLE.Owner,
      USER_ROLE.Editor,
      USER_ROLE.Reporter,
    ],
  },
  {
    title: 'Drafts',
    url: '/administrator/articles-draft',
    icon: faNoteSticky,
    access: [
      USER_ROLE.Admin,
      USER_ROLE.Owner,
      USER_ROLE.Editor,
      USER_ROLE.Reporter,
    ],
  },
  {
    title: 'Comments',
    url: '/administrator/comments',
    icon: faMessage,
    access: [USER_ROLE.Admin, USER_ROLE.Owner],
  },
  {
    title: 'Categories',
    url: '/administrator/categories',
    icon: faTags,
    access: [USER_ROLE.Owner],
  },

  {
    title: 'Article Requests',
    url: '/administrator/article-requests',
    icon: faCodePullRequest,
    access: [
      USER_ROLE.Owner,
      USER_ROLE.Admin,
      USER_ROLE.Editor,
      USER_ROLE.Reporter,
    ],
  },
      // 🏆 Competition added (for Admin + Owner)
  {
    title: 'Competitions',
    url: '/administrator/competitions',
    icon: faTrophy,
    access: [USER_ROLE.Admin, USER_ROLE.Owner],
  },

  {
    title: 'Members',
    url: '/administrator/members',
    icon: faUsers,
    access: [USER_ROLE.Owner, USER_ROLE.Admin],
  },


];
