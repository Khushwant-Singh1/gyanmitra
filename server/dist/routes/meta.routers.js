"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkRequiredFields_middlewares_1 = require("../middlewares/checkRequiredFields.middlewares");
const index_1 = require("../controllers/Articles/index");
const router = (0, express_1.Router)();
router.get('/articles/:_slug', (0, checkRequiredFields_middlewares_1.checkRequiredFields)(['_slug'], checkRequiredFields_middlewares_1.FIELD_SOURCE.params), index_1.getArticleMetaData);
exports.default = router;
