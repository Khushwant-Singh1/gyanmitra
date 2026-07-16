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
} from '@fortawesome/free-solid-svg-icons';
import { USER_ROLE } from './index.constants';

export interface ILinksWithName {
  link: string;
  name: string;
}

export const GET_HELP_LINKS: ILinksWithName[] = [
  { name: 'Contact & FAQ', link: '/contact-us' },
  { name: 'About Us', link: '/about-us' },
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
    title: 'Drafts',
    url: '/administrator/articles-draft',
    icon: faNoteSticky,
    access: [USER_ROLE.Admin, USER_ROLE.Owner, USER_ROLE.Editor],
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
    access: [USER_ROLE.Owner, USER_ROLE.Admin, USER_ROLE.Editor],
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
    access: [USER_ROLE.Owner],
  },


];
