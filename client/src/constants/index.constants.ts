export const DATE_OPTION: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export enum USER_ROLE {
  Viewer = 'Viewer',
  Owner = 'Owner',
  Editor = 'Editor',
  Admin = 'Admin',
}

export enum MEDIA_FILE_TYPES {
  Image = 'image',
  Video = 'video',
}

export enum ARTICLE_STATUS {
  Draft = 'Draft',
  Published = 'Published',
  Private = 'Private',
}

export enum ARTICLE_CONTENT_TYPES {
  News = 'News',
  Article = 'Article',
}

export const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/avif',
  'video/mp4',
];
