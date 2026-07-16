import { Router } from 'express';
import { VerifyJWT } from '../middlewares/auth.middlewares';
import { USER_ROLE } from '../constants';
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import {
  deleteComment,
  editComment,
  getAllComments,
  postComment,
} from '../controllers/comment.controllers';
import { validateObjectId } from '../middlewares/validateObjectId.middlewares';

const router = Router();

router.get('/', VerifyJWT([USER_ROLE.Admin, USER_ROLE.Owner]), getAllComments);

router
  .route('/:_id')
  .post(
    VerifyJWT([
      USER_ROLE.Admin,
      USER_ROLE.Viewer,
      USER_ROLE.Editor,
      USER_ROLE.Owner,
    ]),
    checkRequiredFields(['message'], FIELD_SOURCE.body),
    checkRequiredFields(['_id'], FIELD_SOURCE.params),
    validateObjectId(['_id'], FIELD_SOURCE.params),
    postComment
  )
  .put(
    VerifyJWT([
      USER_ROLE.Admin,
      USER_ROLE.Viewer,
      USER_ROLE.Editor,
      USER_ROLE.Owner,
    ]),
    checkRequiredFields(['message'], FIELD_SOURCE.body),
    checkRequiredFields(['_id'], FIELD_SOURCE.params),
    validateObjectId(['_id'], FIELD_SOURCE.params),
    editComment
  )
  .delete(
    VerifyJWT([
      USER_ROLE.Admin,
      USER_ROLE.Viewer,
      USER_ROLE.Editor,
      USER_ROLE.Owner,
    ]),
    checkRequiredFields(['_id'], FIELD_SOURCE.params),
    validateObjectId(['_id'], FIELD_SOURCE.params),
    deleteComment
  );

export default router;
