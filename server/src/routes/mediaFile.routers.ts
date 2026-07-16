import { Router } from 'express';
import { upload } from '../middlewares/multer.middlewares';
import {
  deleteFile,
  getFileDetail,
  getFiles,
  uploadFile,
} from '../controllers/mediaFile.controllers';
import { VerifyJWT } from '../middlewares/auth.middlewares';
import { ADMINISTRATOR_ROLE } from '../constants';
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import { validateObjectId } from '../middlewares/validateObjectId.middlewares';

const router = Router();

router
  .route('/:_id')
  .get(
    VerifyJWT([
      ADMINISTRATOR_ROLE.Editor,
      ADMINISTRATOR_ROLE.Admin,
      ADMINISTRATOR_ROLE.Owner,
    ]),
    checkRequiredFields(['_id'], FIELD_SOURCE.params),
    validateObjectId(['_id'], FIELD_SOURCE.params),
    getFileDetail
  )
  .delete(
    VerifyJWT([
      ADMINISTRATOR_ROLE.Editor,
      ADMINISTRATOR_ROLE.Admin,
      ADMINISTRATOR_ROLE.Owner,
    ]),
    checkRequiredFields(['_id'], FIELD_SOURCE.params),
    validateObjectId(['_id'], FIELD_SOURCE.params),
    deleteFile
  );

router.post(
  '/',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  upload.single('file'),
  uploadFile
);

router.get(
  '/',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  checkRequiredFields(['file_types'], FIELD_SOURCE.query),
  getFiles
);
export default router;
