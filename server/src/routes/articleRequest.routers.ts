import { Router } from 'express';
import {
  createRequest,
  deleteRequest,
  getMyRequests,
  getReceivedRequests,
  setReject,
} from '../controllers/articleApprovalRequest.controllers';
import { VerifyJWT } from '../middlewares/auth.middlewares';
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import { validateObjectId } from '../middlewares/validateObjectId.middlewares';
import { ADMINISTRATOR_ROLE } from '../constants';

const router = Router();

router.post(
  '/:_articleId',
  VerifyJWT([ADMINISTRATOR_ROLE.Editor]),
  checkRequiredFields(['message', 'receiverId'], FIELD_SOURCE.body),
  checkRequiredFields(['_articleId'], FIELD_SOURCE.params),
  validateObjectId(['_articleId'], FIELD_SOURCE.params),
  validateObjectId(['receiverId'], FIELD_SOURCE.body),
  createRequest
);

router.get(
  '/received',
  VerifyJWT([ADMINISTRATOR_ROLE.Admin, ADMINISTRATOR_ROLE.Owner]),
  getReceivedRequests
);
router.get('/my', VerifyJWT([ADMINISTRATOR_ROLE.Editor]), getMyRequests);
router.put(
  '/:_id/reject',
  VerifyJWT([ADMINISTRATOR_ROLE.Admin, ADMINISTRATOR_ROLE.Owner]),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  setReject
);
router.delete(
  '/:_id',
  VerifyJWT([ADMINISTRATOR_ROLE.Editor]),
  checkRequiredFields(['_id'], FIELD_SOURCE.params),
  validateObjectId(['_id'], FIELD_SOURCE.params),
  deleteRequest
);

export default router;
