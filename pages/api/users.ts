import type { NextApiRequest, NextApiResponse } from "next";
import parsePhoneNumber from "libphonenumber-js";
import { User, Password } from "../../lib/database";
import { isEmailValid } from "../../lib/utils/validation";
import { APIErrorResponse, APIRequest } from "../../lib/utils/api";
import logger from "../../lib/logger/logger";
import { v4 as uuidv4 } from "uuid";

type CreateUserResponse =
  | APIErrorResponse
  | {
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

  return {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    phoneNumber: parsedPhoneNumber.number,
  };
}

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<CreateUserResponse>
) {
  switch (req.method) {
    case "POST":
      postCreateUser(req, res);
      break;
    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}

async function postCreateUser(
  req: APIRequest<CreateUserParams>,
  res: NextApiResponse<CreateUserResponse>
) {
  try {
    // Validate and extract parameters from request body
    const { email, password, firstName, lastName, phoneNumber } =
      validateCreateUserParams(req.body);

    const exists = await User.exists(email, phoneNumber);
    if (exists.email || exists.phoneNumber) {
      res.status(400).json({ error: "Bad request" });

      logger.warn(getInUseWarningText(exists));
      return;
    }

    const user = User.create({
      uuid: uuidv4(),
      email,
      firstName,
      lastName,
      phoneNumber,
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
    logger.error(req.method, req.url, (error as Error).message, error);
    res.status(500).json({ error: "Internal server error" });
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
