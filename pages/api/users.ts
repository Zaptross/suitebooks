import type { NextApiRequest, NextApiResponse } from "next";
import parsePhoneNumber from "libphonenumber-js";
import { User, Password } from "../../lib/database";
import { isEmailValid } from "../../lib/utils/validation";
import {
  APIResponse,
  APIRequest,
  internalServerError,
  badRequest,
} from "../../lib/utils/api";
import logger from "../../lib/logger/logger";
import { v4 as uuidv4 } from "uuid";

type CreateUserResponse = {
  uuid: string;
};

type CreateUserParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

function validateCreateUserParams(params: CreateUserParams) {
  let parsedPhoneNumber: ReturnType<typeof parsePhoneNumber>;
  if (params.phoneNumber) {
    parsedPhoneNumber = parsePhoneNumber(params.phoneNumber);
  }

  logger.debug(JSON.stringify(params));

  if (
    !params.email ||
    !params.password ||
    !params.firstName ||
    !params.lastName ||
    !params.phoneNumber
  ) {
    throw new Error("Missing required parameters");
  }

  if (!isEmailValid(params.email)) {
    throw new Error("Invalid email");
  }
  if (!parsedPhoneNumber?.isValid()) {
    throw new Error("Invalid phone number");
  }

  const failReasons = Password.checkFailedPasswordRules(params.password);
  if (failReasons.length > 0) {
    throw new Error(`Password failed rules: ${failReasons.join(", ")}`);
  }

  return {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    phoneNumber: parsedPhoneNumber.number,
  };
}

export default async function (
  req: APIRequest<CreateUserParams>,
  res: APIResponse<CreateUserResponse>
) {
  switch (req.method) {
    case "POST":
      postCreateUser(...([req, res] as Parameters<typeof postCreateUser>));
      break;
    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}

async function postCreateUser(
  req: APIRequest<CreateUserParams>,
  res: APIResponse<CreateUserResponse>
) {
  // Validate parameters from request body return 400 with error message if invalid
  let validatedParams: CreateUserParams;
  try {
    validatedParams = validateCreateUserParams(req.body);
  } catch (error) {
    return badRequest(res, error as Error);
  }

  try {
    const { email, password, firstName, lastName, phoneNumber } =
      validatedParams;

    const exists = await User.exists(email, phoneNumber);
    if (exists.email || exists.phoneNumber) {
      // log warning that someone tried to create a user with an email or phone number that is already in use
      // then return 400 with non-specific error message to prevent user enumeration
      logger.warn(getInUseWarningText(exists));
      return badRequest(res, new Error("Bad request"));
    }

    const user = User.create({
      uuid: uuidv4(),
      email,
      firstName,
      lastName,
      phoneNumber,
      // TODO - allow admins to create users of different types if they have the permission and are authenticated
    });

    const userPassword = Password.create({
      uuid: uuidv4(),
      user: user,
      hash: await Password.hash(password),
    });

    await user.save();
    await userPassword.save();

    res.status(200).json({ uuid: user.uuid });
  } catch (error) {
    return internalServerError(req, res, error as Error);
  }
}

function getInUseWarningText({
  email,
  phoneNumber,
  uuid,
}: {
  email: boolean;
  phoneNumber: boolean;
  uuid?: string;
}) {
  return `Someone tried to create a user with a${email ? "n" : ""} ${
    email ? "email" : "phone number"
  }${
    email && phoneNumber ? " and phone number " : ""
  } that is already in use by ${uuid}`;
}
