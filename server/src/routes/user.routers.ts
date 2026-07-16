import { Router } from 'express';
import {
  checkRequiredFields,
  FIELD_SOURCE,
} from '../middlewares/checkRequiredFields.middlewares';
import * as UserController from '../controllers/Users/index';
import { TryVerifyJWT, VerifyJWT } from '../middlewares/auth.middlewares';
import { ADMINISTRATOR_ROLE, USER_ROLE } from '../constants';
import {
  createInvitation,
  createInvitationReqFields,
  isValidInviteToken,
} from '../controllers/invitation.controllers';

const router = Router();

router.get('/home', UserController.getHomePageContent);

router.post(
  '/invite',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner, ADMINISTRATOR_ROLE.Admin]),
  checkRequiredFields(createInvitationReqFields, FIELD_SOURCE.body),
  createInvitation
);

router.get(
  '/invite/validate/:_token',
  checkRequiredFields(['_token'], FIELD_SOURCE.params),
  isValidInviteToken
);

router.get(
  '/me',
  TryVerifyJWT([
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Owner,
    USER_ROLE.Viewer,
  ]),
  UserController.getCurrentUserSession
);

router.get(
  '/dashboard',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Owner,
  ]),
  UserController.getDashboardContent
);

router.get(
  '/',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner]),
  UserController.getAllUsers
);

router.get(
  '/name',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Owner,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Editor,
  ]),
  UserController.getUsersName
);

export default router;
