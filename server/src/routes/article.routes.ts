import { Router } from 'express';
import * as ArticleController from '../controllers/Articles/index';
import { VerifyJWT } from '../middlewares/auth.middlewares';
import { ADMINISTRATOR_ROLE } from '../constants';
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import { validateObjectId } from '../middlewares/validateObjectId.middlewares';

const router = Router();

router.get(
  '/page/:_slug',
  checkRequiredFields(['_slug'], FIELD_SOURCE.params),
  ArticleController.getArticlePageContent
);

router.get(
  '/',
  VerifyJWT([ADMINISTRATOR_ROLE.Admin, ADMINISTRATOR_ROLE.Owner]),
  ArticleController.getAllArticles
);
router.get('/search', ArticleController.getQuery);

router.get(
  '/drafts',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  ArticleController.getDraftArticles
);

router.get(
  '/draft/:_id',
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  VerifyJWT([
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  ArticleController.getDraftArticle
);

// Article Creation
router.post(
  '/',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  checkRequiredFields(
    ArticleController.CREATE_ARTICLE_REQ_FIELDS,
    FIELD_SOURCE.body
  ),
  validateObjectId(['categoryId', 'featuredMediaId'], FIELD_SOURCE.body),
  ArticleController.create
);

// Article Deletion
router.delete(
  '/:_id',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  ArticleController.remove
);

// Article Editing
router.put(
  '/:_id/edit',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  ArticleController.edit
);

// Article Cloning
router.post(
  '/:_id/clone',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  ArticleController.makeClone
);

// Article Updating
router.put(
  '/:_id/update',
  VerifyJWT([ADMINISTRATOR_ROLE.Admin, ADMINISTRATOR_ROLE.Owner]),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  checkRequiredFields(['cloneArticleId'], FIELD_SOURCE.body),
  validateObjectId(['cloneArticleId'], FIELD_SOURCE.body),
  ArticleController.update
);

// Article Publishing
router.put(
  '/:_id/publish',
  VerifyJWT([ADMINISTRATOR_ROLE.Admin, ADMINISTRATOR_ROLE.Owner]),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  ArticleController.publish
);

// Set Article as Private
router.put(
  '/:_id/private',
  VerifyJWT([ADMINISTRATOR_ROLE.Admin, ADMINISTRATOR_ROLE.Owner]),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  ArticleController.setPrivate
);

// Check if an Article Exists
router.get(
  '/exists/:_slug',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  checkRequiredFields(['_slug'], FIELD_SOURCE.params),
  ArticleController.getIsSlugExits
);

// Report an Article
router.post(
  '/:_id/report',
  checkRequiredFields(['comment'], FIELD_SOURCE.body),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  ArticleController.reportForArticle
);

export default router;
