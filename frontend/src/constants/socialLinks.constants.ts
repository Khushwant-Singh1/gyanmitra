import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ILinkWIthIcon {
  icon: IconDefinition;
  url: string;
}

import {
  faFacebookF,
  faXTwitter,
  faInstagram,
  faYoutube,
  faTelegram,
} from '@fortawesome/free-brands-svg-icons';

export const FOLLOW_US_LINKS: ILinkWIthIcon[] = [
  {
    icon: faFacebookF,
    url: 'https://www.facebook.com/people/Gyanmitra-News/61564915062659/',
  },
  { icon: faXTwitter, url: 'https://x.com/Gyanmitranews' },
  { icon: faInstagram, url: 'https://www.instagram.com/gyanmitranews/' },
  { icon: faYoutube, url: 'https://www.youtube.com/@GyanmitraNews' },
  { icon: faTelegram, url: '#' },
];
