import {
  ARTICLE_STATUS,
  MEDIA_FILE_TYPES,
  USER_ROLE,
} from '@/constants/index.constants';

export interface IApiUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  role: USER_ROLE;
}

export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
}

export interface IApiError {
  success: boolean;
  message: string;
  errors: [any];
  statusCode: number;
}

export interface IApiHome {
  recentPublished: {
    uploaded: Date;
    description: string;
    headline: string;
    slug: string;
    _id: string;
    category: string;
    featuredMedia: {
      url: string;
      fileType: MEDIA_FILE_TYPES;
      thumbnail?: string;
      name: string;
    };
  };
  todayPublished: {
    uploaded: Date;
    headline: string;
    slug: string;
    _id: string;
    category: string;
    featuredMedia: {
      url: string;
      fileType: MEDIA_FILE_TYPES;
      thumbnail?: string;
      name: string;
    };
  }[];
  articlePublished: {
    uploaded: Date;
    headline: string;
    slug: string;
    _id: string;
    category: string;
    featuredMedia: {
      url: string;
      fileType: MEDIA_FILE_TYPES;
      thumbnail?: string;
      name: string;
    };
  }[];
  mixedArticles: {
    uploaded: Date;
    description: string;
    headline: string;
    slug: string;
    _id: string;
    category: string;
    featuredMedia: {
      url: string;
      fileType: MEDIA_FILE_TYPES;
      thumbnail?: string;
      name: string;
    };
  }[];
}

export interface IApiCurrentUserSession {
  user: IApiUser;
}
export interface IApiArticle {
  articleDetails: {
    _id: string;
    headline: string;
    slug: string;
    description: string;
    tags: string[];
    views: number;
    publishedDate: string;
    categoryName: string;
    contentData: string;
    featuredMediaInfo: {
      fileType: MEDIA_FILE_TYPES;
      url: string;
      name: string;
      thumbnail?: string;
    };
    authorName: string;
    
    // --- New SEO Fields Added Here ---
    metaTitle?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    robotsTag?: string;
    // ---------------------------------

    comments: {
      userName: string;
      message: string;
      _id: string;
      updatedAt: string;
    }[];
  };
  trendingArticles: {
    _id: string;
    headline: string;
    slug: string;
    featuredMediaInfo: {
      fileType: MEDIA_FILE_TYPES;
      url: string;
      name: string;
      thumbnail?: string;
    };
    categoryName: string;
    publishedDate: string;
  }[];
  recentArticles: {
    _id: string;
    headline: string;
    slug: string;
    featuredMediaInfo: {
      fileType: MEDIA_FILE_TYPES;
      url: string;
      thumbnail?: string;
      name: string;
    };
    categoryName: string;
    publishedDate: string;
  }[];
}

export interface IApiSignIn {
  user: IApiUser;
  accessToken: string;
}

export interface IApiSignUp {
  user: IApiUser;
}

export interface IApiDashboard {
  totalViews: number;
  topArticles: {
    _id: string;
    views: number;
    headline: string;
    published: string;
    featuredMedia: {
      fileType: MEDIA_FILE_TYPES;
      fileUrl: string;
      thumbnail?: string;
      name: string;
    };
  }[];
  recentArticles: {
    _id: string;
    firstName: string;
    headline: string;
    lastName: string;
    featuredMedia: {
      fileType: MEDIA_FILE_TYPES;
      fileUrl: string;
      thumbnail?: string;
      name: string;
    };
    published: string;
  }[];
  recentComments: {
    _id: string;
    message: string;
    createdAt: string;
    firstName: string;
    lastName: string;
  }[];
  recentUsers: {
    _id: string;
    role: USER_ROLE;
    createdAt: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
}

export interface IApiArticleManage {
  _id: string;
  status: ARTICLE_STATUS;
  headline: string;
  description: string;
  views: number;
  category: string;
  author: { firstName: string; lastName: string };
  lastUpdated: string;
  contentType: string;
  slug: string;
  serialNumber: number;
  scheduledPublishDate?: string;
}

export interface IApiDraftArticleManage {
  _id: string;
  status: ARTICLE_STATUS;
  headline: string;
  description: string;
  category: string;
  createdDate: string;
  originalArticleId?: string;
  featuredMedia: {
    fileType: MEDIA_FILE_TYPES;
    fileUrl: string;
    thumbnail?: string;
    name: string;
  };
  tags: string[];
  scheduledPublishDate?: string;
}

export interface IApiSelectMediaFile {
  files: {
    _id: string;
    name: string;
    format: string;
    fileUrl: string;
    resourceType: MEDIA_FILE_TYPES;
    lastModified: string;
    fileSize: number;
  }[];
  totalPages: number;
  currentPage: number;
}
export interface IApiEditArticle {
  _id: string;
  content: string;
  headline: string;
  tags: string[];
  slug: string;
  description: string;
  categoryId: string;
  featuredMedia: string;
  // --- New SEO Fields ---
  metaTitle?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  robotsTag?: string;
  scheduledPublishDate?: string;
}

export interface IApiManageComment {
  _id: string;
  userName: { firstName: string; lastName: string };
  message: string;
  updatedAt: string;
  email: string;
}
export interface IApiManageMembers {
  _id: string;
  userName: { firstName: string; lastName: string };
  role: USER_ROLE;
  inviter: string;
  createdAt: string;
  email: string;
  emailVerified: boolean;
}

export interface IApiManageCategory {
  _id: string;
  name: string;
  subcategories: { _id: string; name: string }[];
}

export interface IApiIsArticleExits {
  _id: string | null;
  articleExists: boolean;
}

export interface IApiAEditCategory {
  _id: string;
  name: string;
  slug: string;
  parentId: string;
  isActive: boolean;
  index: number;
}
export interface IApiCategory {
  categoryCoverArticle: {
    _id: string;
    featuredMedia: {
      fileUrl: string;
      fileType: MEDIA_FILE_TYPES;
      name: string;
      thumbnail?: string;
    };
    headline: string;
    slug: string;
    published: string;
    description?: string;
    categoryName: string;
  };
  trendingArticles: {
    _id: string;
    featuredMedia: {
      fileUrl: string;
      fileType: MEDIA_FILE_TYPES;
      name: string;
      thumbnail?: string;
    };
    title: string;
    slug: string;
    published: string;
    categoryName: string;
  }[];
  recentPosts: {
    _id: string;
    featuredMedia: {
      fileUrl: string;
      fileType: MEDIA_FILE_TYPES;
      name: string;
      thumbnail?: string;
    };
    title: string;
    slug: string;
    published: string;
    description?: string;
    categoryName: string;
  }[];
  articleTypeArticles: {
    _id: string;
    featuredMedia: {
      fileUrl: string;
      fileType: MEDIA_FILE_TYPES;
      name: string;
      thumbnail?: string;
    };
    title: string;
    slug: string;
    published: string;
    categoryName: string;
  }[];
}

export interface IApiIsValidInviteToken {
  _id: string;
  receiverEmail: string;
  receiverRole: USER_ROLE;
}

export interface IApiArticleApprovalRequest {
  _id: string;
  message: string;
  reason: string;
  articleId: string;
  status: string;
  rejectedMessage?: string;
  user: string;
  createdAt: string;
}

export interface IApiSearch {
  _id: string;
  featuredMedia: {
    fileUrl: string;
    fileType: MEDIA_FILE_TYPES;
    name: string;
    thumbnail?: string;
  };
  title: string;
  slug: string;
  published: string;
  description?: string;
  categoryName: string;
}

export interface IApiCompetition {
  _id: string;
  title: string;
  slug: string;
  introduction: string;
  howToParticipate: string;
  startDate: string;
  deadline: string;
  resultDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Open' | 'Closed' | 'Result';
}

export interface IApiParticipant {
  _id: string;
  regNumber: string;
  fullName: string;
  schoolCollege: string;
  mobileNumber: string;
  emailId: string;
  answer?: string;
  uploadFileUrl?: string;
  address: string;
  status: 'pending' | 'pass' | 'fail';
  rank?: string;
}