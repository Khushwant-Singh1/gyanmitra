import { Router } from 'express';
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import { getArticleMetaData } from '../controllers/Articles/index';

const router = Router();

router.get(
  '/articles/:_slug',
  checkRequiredFields(['_slug'], FIELD_SOURCE.params),
  getArticleMetaData
);

export default router;
