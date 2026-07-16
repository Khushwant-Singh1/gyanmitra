"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ArticleController = __importStar(require("../controllers/Articles/index"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const constants_1 = require("../constants");
const checkRequiredFields_middlewares_1 = require("../middlewares/checkRequiredFields.middlewares");
const validateObjectId_middlewares_1 = require("../middlewares/validateObjectId.middlewares");
const router = (0, express_1.Router)();
router.get('/page/:_slug', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_slug'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), ArticleController.getArticlePageContent);
router.get('/', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Admin, constants_1.ADMINISTRATOR_ROLE.Owner]), ArticleController.getAllArticles);
router.get('/search', ArticleController.getQuery);
router.get('/drafts', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), ArticleController.getDraftArticles);
router.get('/draft/:_id', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), ArticleController.getDraftArticle);
// Article Creation
router.post('/', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(ArticleController.CREATE_ARTICLE_REQ_FIELDS, checkRequiredFields_middlewares_1.FIELD_SOURCE.body), (0, validateObjectId_middlewares_1.validateObjectId)(['categoryId', 'featuredMediaId'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), ArticleController.create);
// Article Deletion
router.delete('/:_id', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), ArticleController.remove);
// Article Editing
router.put('/:_id/edit', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), ArticleController.edit);
// Article Cloning
router.post('/:_id/clone', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), ArticleController.makeClone);
// Article Updating
router.put('/:_id/update', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Admin, constants_1.ADMINISTRATOR_ROLE.Owner]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['cloneArticleId'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), (0, validateObjectId_middlewares_1.validateObjectId)(['cloneArticleId'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), ArticleController.update);
// Article Publishing
router.put('/:_id/publish', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Admin, constants_1.ADMINISTRATOR_ROLE.Owner]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), ArticleController.publish);
// Set Article as Private
router.put('/:_id/private', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Admin, constants_1.ADMINISTRATOR_ROLE.Owner]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), ArticleController.setPrivate);
// Check if an Article Exists
router.get('/exists/:_slug', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Editor,
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_slug'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), ArticleController.getIsSlugExits);
// Report an Article
router.post('/:_id/report', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['comment'], checkRequiredFields_middlewares_1.FIELD_SOURCE.body), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), ArticleController.reportForArticle);
exports.default = router;
