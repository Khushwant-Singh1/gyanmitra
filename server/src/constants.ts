export const DB_NAME = 'Gyanmitra';

export const USER_FIELDS_TO_HIDE =
  '-password -phone -emailVerification -inviterId -deactivatorId';

export const TEMPLATE_FILE_DEST_FORM_UTILS = '../../templates/';

export const SLUGIFY_OPTIONS: {
  replacement?: string;
  remove?: RegExp;
  lower?: boolean;
  strict?: boolean;
  locale?: string;
  trim?: boolean;
} = { locale: 'en', lower: true, trim: true, replacement: '-' };

export enum MODELS {
  User = 'User',
  ArticleRequest = 'Article_Request',
  Bug = 'Bug',
  Report = 'Report',
  Category = 'Category',
  Article = 'Article',
  Invitation = 'Invitation',
  MediaFile = 'MediaFile',
  ArticleContent = 'Article_Content',
  Comment = 'Comment',
  ArticleView = 'Article_View',
}

export enum USER_ROLE {
  Viewer = 'Viewer',
  Owner = 'Owner',
  Editor = 'Editor',
  Admin = 'Admin',
}

export enum ADMINISTRATOR_ROLE {
  Owner = USER_ROLE.Owner,
  Editor = USER_ROLE.Editor,
  Admin = USER_ROLE.Admin,
}

export enum ARTICLE_STATUS {
  Draft = 'Draft',
  Published = 'Published',
  Private = 'Private',
  Scheduled = 'Scheduled',
}

export enum REQUEST_REASON {
  Publish = 'Publish',
  Update = 'Update',
}

export enum REQUEST_STATUS {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum EMAIL_TEMPLATES {
  Invitation = 'invitation',
  Verification = 'verification',
}

export enum EMAIL_SUBJECTS {
  Invitation = 'Invitation',
  Verification = 'Verification',
}

export enum MEDIA_FILE_TYPES {
  Image = 'image',
  Video = 'video',
}

export enum ARTICLE_CONTENT_TYPES {
  News = 'News',
  Article = 'Article',
}

export const COOKIE_OPTION = {
  secure: true,
  httpOnly: true,
};

export enum ARTICLE_ACTIONS {
  Publish = 'Publish',
  Private = 'Private',
  Update = 'Update',
  Schedule = 'Schedule',
}
export const getMediaLookupPipeline = [
  {
    $lookup: {
      from: 'mediafiles',
      localField: 'featuredMediaId',
      foreignField: '_id',
      as: 'featuredMedia',
    },
  },
  {
    $unwind: {
      path: '$featuredMedia',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'mediafiles',
      foreignField: '_id',
      localField: 'featuredMedia.thumbnail',
      as: 'thumbnailMedia',
    },
  },

  {
    $unwind: {
      path: '$thumbnailMedia',
      preserveNullAndEmptyArrays: true,
    },
  },
];
