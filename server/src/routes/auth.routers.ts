import { Router } from 'express';
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import * as UserController from '../controllers/Users/index';
import { validateObjectId } from '../middlewares/validateObjectId.middlewares';

const router = Router();

router.post(
  '/sign-in',
  checkRequiredFields(
    UserController.USER_SIGN_IN_REQ_FIELDS,
    FIELD_SOURCE.body
  ),
  UserController.signIn
);

router.post('/sign-out', UserController.signOut);

router.post(
  '/viewer',
  checkRequiredFields(
    UserController.VIEWER_SIGN_UP_REQ_FIELDS,
    FIELD_SOURCE.body
  ),
  UserController.viewerSignup
);

router.post(
  '/viewer/verify-email/:_token',
  checkRequiredFields(['_token'], FIELD_SOURCE.params),
  UserController.verifyEmailWithToken
);

router.post(
  '/viewer/resend-verification',
  checkRequiredFields(['userId'], FIELD_SOURCE.query),
  validateObjectId(['userId'], FIELD_SOURCE.query),
  UserController.reSendEmailVerification
);

router.post(
  '/admin/:_token',
  checkRequiredFields(
    UserController.ADMINISTRATOR_SIGN_UP_REQ_FIELDS,
    FIELD_SOURCE.body
  ),
  checkRequiredFields(['_token'], FIELD_SOURCE.params),
  UserController.administratorSignUp
);

export default router;
