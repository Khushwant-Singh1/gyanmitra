"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMediaLookupPipeline = exports.ARTICLE_ACTIONS = exports.COOKIE_OPTION = exports.ARTICLE_CONTENT_TYPES = exports.MEDIA_FILE_TYPES = exports.EMAIL_SUBJECTS = exports.EMAIL_TEMPLATES = exports.REQUEST_STATUS = exports.REQUEST_REASON = exports.ARTICLE_STATUS = exports.ADMINISTRATOR_ROLE = exports.USER_ROLE = exports.MODELS = exports.SLUGIFY_OPTIONS = exports.TEMPLATE_FILE_DEST_FORM_UTILS = exports.USER_FIELDS_TO_HIDE = exports.DB_NAME = void 0;
exports.DB_NAME = 'Gyanmitra';
exports.USER_FIELDS_TO_HIDE = '-password -phone -emailVerification -inviterId -deactivatorId';
exports.TEMPLATE_FILE_DEST_FORM_UTILS = '../../templates/';
exports.SLUGIFY_OPTIONS = { locale: 'en', lower: true, trim: true, replacement: '-' };
var MODELS;
(function (MODELS) {
    MODELS["User"] = "User";
    MODELS["ArticleRequest"] = "Article_Request";
    MODELS["Bug"] = "Bug";
    MODELS["Report"] = "Report";
    MODELS["Category"] = "Category";
    MODELS["Article"] = "Article";
    MODELS["Invitation"] = "Invitation";
    MODELS["MediaFile"] = "MediaFile";
    MODELS["ArticleContent"] = "Article_Content";
    MODELS["Comment"] = "Comment";
    MODELS["ArticleView"] = "Article_View";
})(MODELS || (exports.MODELS = MODELS = {}));
var USER_ROLE;
(function (USER_ROLE) {
    USER_ROLE["Viewer"] = "Viewer";
    USER_ROLE["Owner"] = "Owner";
    USER_ROLE["Editor"] = "Editor";
    USER_ROLE["Admin"] = "Admin";
})(USER_ROLE || (exports.USER_ROLE = USER_ROLE = {}));
var ADMINISTRATOR_ROLE;
(function (ADMINISTRATOR_ROLE) {
    ADMINISTRATOR_ROLE["Owner"] = "Owner";
    ADMINISTRATOR_ROLE["Editor"] = "Editor";
    ADMINISTRATOR_ROLE["Admin"] = "Admin";
})(ADMINISTRATOR_ROLE || (exports.ADMINISTRATOR_ROLE = ADMINISTRATOR_ROLE = {}));
var ARTICLE_STATUS;
(function (ARTICLE_STATUS) {
    ARTICLE_STATUS["Draft"] = "Draft";
    ARTICLE_STATUS["Published"] = "Published";
    ARTICLE_STATUS["Private"] = "Private";
})(ARTICLE_STATUS || (exports.ARTICLE_STATUS = ARTICLE_STATUS = {}));
var REQUEST_REASON;
(function (REQUEST_REASON) {
    REQUEST_REASON["Publish"] = "Publish";
    REQUEST_REASON["Update"] = "Update";
})(REQUEST_REASON || (exports.REQUEST_REASON = REQUEST_REASON = {}));
var REQUEST_STATUS;
(function (REQUEST_STATUS) {
    REQUEST_STATUS["Pending"] = "Pending";
    REQUEST_STATUS["Approved"] = "Approved";
    REQUEST_STATUS["Rejected"] = "Rejected";
})(REQUEST_STATUS || (exports.REQUEST_STATUS = REQUEST_STATUS = {}));
var EMAIL_TEMPLATES;
(function (EMAIL_TEMPLATES) {
    EMAIL_TEMPLATES["Invitation"] = "invitation";
    EMAIL_TEMPLATES["Verification"] = "verification";
})(EMAIL_TEMPLATES || (exports.EMAIL_TEMPLATES = EMAIL_TEMPLATES = {}));
var EMAIL_SUBJECTS;
(function (EMAIL_SUBJECTS) {
    EMAIL_SUBJECTS["Invitation"] = "Invitation";
    EMAIL_SUBJECTS["Verification"] = "Verification";
})(EMAIL_SUBJECTS || (exports.EMAIL_SUBJECTS = EMAIL_SUBJECTS = {}));
var MEDIA_FILE_TYPES;
(function (MEDIA_FILE_TYPES) {
    MEDIA_FILE_TYPES["Image"] = "image";
    MEDIA_FILE_TYPES["Video"] = "video";
})(MEDIA_FILE_TYPES || (exports.MEDIA_FILE_TYPES = MEDIA_FILE_TYPES = {}));
var ARTICLE_CONTENT_TYPES;
(function (ARTICLE_CONTENT_TYPES) {
    ARTICLE_CONTENT_TYPES["News"] = "News";
    ARTICLE_CONTENT_TYPES["Article"] = "Article";
})(ARTICLE_CONTENT_TYPES || (exports.ARTICLE_CONTENT_TYPES = ARTICLE_CONTENT_TYPES = {}));
exports.COOKIE_OPTION = {
    secure: true,
    httpOnly: true,
};
var ARTICLE_ACTIONS;
(function (ARTICLE_ACTIONS) {
    ARTICLE_ACTIONS["Publish"] = "Publish";
    ARTICLE_ACTIONS["Private"] = "Private";
    ARTICLE_ACTIONS["Update"] = "Update";
})(ARTICLE_ACTIONS || (exports.ARTICLE_ACTIONS = ARTICLE_ACTIONS = {}));
exports.getMediaLookupPipeline = [
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
