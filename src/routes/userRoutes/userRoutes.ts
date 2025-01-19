// ------------------------------------------------------------------------------------------

import { Router } from 'express';

import { userUrl } from '../../constants/urls/urls';
import {
    checkEmailExists, createUser, getCurrentUser, getSignUpToken, signInUser, signOutUser
} from '../../controllers/userControllers/userControllers';
import authMiddleware from '../../middlewares/authMiddleware/authMiddleware';
import upload from '../../utils/storage/storage';

// ------------------------------------------------------------------------------------------

const router = Router();

// ------------------------------------------------------------------------------------------

router.post(userUrl.createUser, upload.single('avatar'), createUser);
router.post(userUrl.signInUser, signInUser);
router.post(userUrl.signOutUser, signOutUser);
router.post(userUrl.checkEmailExists, checkEmailExists);
router.get(userUrl.getSignUpToken, getSignUpToken);
router.get(userUrl.getCurrentUser, authMiddleware, getCurrentUser);

// ------------------------------------------------------------------------------------------

export default router;

// ------------------------------------------------------------------------------------------
