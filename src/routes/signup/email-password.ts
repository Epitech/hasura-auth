import { RequestHandler } from 'express';

import { sendError } from '@/errors';
import { UserRegistrationOptionsWithRedirect } from '@/types';
import { ENV, getSignInResponse, getUserByEmail } from '@/utils';
import { createUserAndSendVerificationEmail } from '@/utils/user/email-verification';
import { Joi, email, registrationOptions } from '@/validation';

export const signUpEmailPasswordSchema = Joi.object({
  email: email.required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  // password: passwordInsert.required(),
  options: registrationOptions,
}).meta({ className: 'SignUpEmailPasswordSchema' });

export const signUpEmailPasswordHandler: RequestHandler<
  {},
  {},
  {
    email: string;
    firstName: string;
    lastName: string;
    // password: string;
    options: UserRegistrationOptionsWithRedirect;
  }
> = async (req, res) => {
  const { body } = req;
  const { email, firstName, lastName, options } = body;

  if (req.auth?.defaultRole != 'admin') {
    return sendError(res, 'route-not-found');
  }

  if (ENV.AUTH_DISABLE_SIGNUP) {
    return sendError(res, 'signup-disabled');
  }

  // check if email already in use by some other user
  if (await getUserByEmail(email)) {
    return sendError(res, 'email-already-in-use');
  }

  const user = await createUserAndSendVerificationEmail(
    email,
    firstName,
    lastName,
    options,
  );

  // SIGNIN_EMAIL_VERIFIED_REQUIRED = true => User must verify their email before signing in.
  // SIGNIN_EMAIL_VERIFIED_REQUIRED = false => User don't have to verify their email before signin in.
  if (ENV.AUTH_EMAIL_SIGNIN_EMAIL_VERIFIED_REQUIRED) {
    return res.send({ session: null, mfa: null });
  }

  const signInResponse = await getSignInResponse({
    userId: user.id,
    checkMFA: false,
  });

  return res.send(signInResponse);
};
