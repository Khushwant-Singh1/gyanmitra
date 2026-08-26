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
  '/create',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner, ADMINISTRATOR_ROLE.Admin]),
  checkRequiredFields(
    UserController.CREATE_MEMBER_REQ_FIELDS,
    FIELD_SOURCE.body
  ),
  UserController.createMember
);

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
    ADMINISTRATOR_ROLE.Reporter,
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
    ADMINISTRATOR_ROLE.Reporter,
  ]),
  UserController.getDashboardContent
);

router.get(
  '/',
  VerifyJWT([ADMINISTRATOR_ROLE.Owner, ADMINISTRATOR_ROLE.Admin]),
  UserController.getAllUsers
);

router.get(
  '/name',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Owner,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Reporter,
  ]),
  UserController.getUsersName
);

router.patch(
  '/profile',
  VerifyJWT([
    ADMINISTRATOR_ROLE.Owner,
    ADMINISTRATOR_ROLE.Admin,
    ADMINISTRATOR_ROLE.Editor,
    ADMINISTRATOR_ROLE.Reporter,
    USER_ROLE.Viewer,
  ]),
  UserController.updateProfile
);

export default router;
