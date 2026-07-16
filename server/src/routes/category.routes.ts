import { Router } from 'express';
import { VerifyJWT } from '../middlewares/auth.middlewares';
import { ADMINISTRATOR_ROLE } from '../constants';
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import {
  getActiveCategories,
  getCategory,
  getCategoriesWithSubcategories,
  getCategoryPageContent,
  CREATE_CATEGORY_REQ_FIELDS,
  createCategory,
  deleteCategory,
  EDIT_CATEGORY_REQ_FIELDS,
  editCategory,
  getAllCategories,
  getActiveSubcategories,
} from '../controllers/category.controllers';
import { validateObjectId } from '../middlewares/validateObjectId.middlewares';

const router = Router();

// 1. NON-PARAMETERIZED ROUTES (Static paths)
router.post(
  '/',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner]),
  checkRequiredFields(CREATE_CATEGORY_REQ_FIELDS, FIELD_SOURCE.body),
  createCategory
);

router.get(
  '/',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Owner,
    ADMINISTRATOR_ROLE.Editor,
  ]),
  getAllCategories
);

router.get('/active', getActiveCategories);

router.get(
  '/manage',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner]),
  getCategoriesWithSubcategories
);

// 2. SPECIFIC PARAMETERIZED ROUTES (More specific paths first)
router.get(
  '/page/:_name',
  checkRequiredFields(['_name'], FIELD_SOURCE.params),
  getCategoryPageContent
);

// FIX: This must come BEFORE the generic /:_id route
router.get(
  '/:_id/subcategories/active',
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  getActiveSubcategories
);

// 3. GENERIC ID ROUTES (Least specific, must be last)
router
  .route('/:_id')
  .put(
    VerifyJWT([ADMINISTRATOR_ROLE.Owner]),
    checkRequiredFields(['_id'], FIELD_SOURCE.params),
    validateObjectId(['_id'], FIELD_SOURCE.params),
    checkRequiredFields(EDIT_CATEGORY_REQ_FIELDS, FIELD_SOURCE.body),
    editCategory
  )
  .delete(
    VerifyJWT([ADMINISTRATOR_ROLE.Owner]),
    checkRequiredFields(['_id'], FIELD_SOURCE.params),
    validateObjectId(['_id'], FIELD_SOURCE.params),
    deleteCategory
  )
  .get(
    VerifyJWT([ADMINISTRATOR_ROLE.Owner]),
    checkRequiredFields(['_id'], FIELD_SOURCE.params),
    validateObjectId(['_id'], FIELD_SOURCE.params),
    getCategory
  );

export default router;
