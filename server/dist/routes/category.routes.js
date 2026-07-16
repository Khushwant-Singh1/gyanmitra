"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const constants_1 = require("../constants");
const checkRequiredFields_middlewares_1 = require("../middlewares/checkRequiredFields.middlewares");
const category_controllers_1 = require("../controllers/category.controllers");
const validateObjectId_middlewares_1 = require("../middlewares/validateObjectId.middlewares");
const router = (0, express_1.Router)();
// 1. NON-PARAMETERIZED ROUTES (Static paths)
router.post('/', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(category_controllers_1.CREATE_CATEGORY_REQ_FIELDS, checkRequiredFields_middlewares_1.FIELD_SOURCE.body), category_controllers_1.createCategory);
router.get('/', (0, auth_middlewares_1.VerifyJWT)([
    constants_1.ADMINISTRATOR_ROLE.Admin,
    constants_1.ADMINISTRATOR_ROLE.Owner,
    constants_1.ADMINISTRATOR_ROLE.Editor,
]), category_controllers_1.getAllCategories);
router.get('/active', category_controllers_1.getActiveCategories);
router.get('/manage', (0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner]), category_controllers_1.getCategoriesWithSubcategories);
// 2. SPECIFIC PARAMETERIZED ROUTES (More specific paths first)
router.get('/page/:_name', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_name'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), category_controllers_1.getCategoryPageContent);
// FIX: This must come BEFORE the generic /:_id route
router.get('/:_id/subcategories/active', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), category_controllers_1.getActiveSubcategories);
// 3. GENERIC ID ROUTES (Least specific, must be last)
router
    .route('/:_id')
    .put((0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(category_controllers_1.EDIT_CATEGORY_REQ_FIELDS, checkRequiredFields_middlewares_1.FIELD_SOURCE.body), category_controllers_1.editCategory)
    .delete((0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), category_controllers_1.deleteCategory)
    .get((0, auth_middlewares_1.VerifyJWT)([constants_1.ADMINISTRATOR_ROLE.Owner]), (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), (0, validateObjectId_middlewares_1.validateObjectId)(['_id'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), category_controllers_1.getCategory);
exports.default = router;
