import { NextApiRequest } from "next";
import { v4 as uuidv4 } from "uuid";
import { Password } from "../../../../lib/database";
import logger from "../../../../lib/logger/logger";
import {
  APIRequest,
  APIResponse,
  badRequest,
  internalServerError,
  okayResponse,
} from "../../../../lib/utils/api";

type UrlParams = {
  userUuid: string;
};

export default function (
  req: APIRequest<unknown, UrlParams>,
  res: APIResponse<unknown>
) {
  switch (req.method) {
    case "PUT":
      return putChangeUserPassword(
        ...([req, res] as Parameters<typeof putChangeUserPassword>)
      );
    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}

type PutUserBody = {
  oldPassword: string;
  newPassword: string;
};

async function putChangeUserPassword(
  req: APIRequest<PutUserBody, UrlParams>,
  res: APIResponse
) {
  try {
    const {
      body: { oldPassword, newPassword },
      query: { userUuid },
    } = req;

    if (!oldPassword || !newPassword) {
      return badRequest(res, new Error("Missing oldPassword or newPassword"));
    }

    if (Password.checkFailedPasswordRules(newPassword).length > 0) {
      return badRequest(res, new Error("Invalid new password"));
    }

    if (Password.checkFailedPasswordRules(oldPassword).length > 0) {
      return badRequest(res, new Error("Invalid old password"));
    }

    // TODO - check authenticated user is the same as the userUuid in the URL OR the authenticated user is an admin

    const password = await Password.getForUser(userUuid);

    logger.debug("password's user uuid", password?.user?.uuid);

    if (!password) {
      return badRequest(res, new Error("Bad request"));
    }

    if (!(await password.verify(oldPassword))) {
      return badRequest(res, new Error("Bad request"));
    }

    logger.debug(`Changing password for user ${userUuid}`);

    const newPasswordHash = await Password.hash(newPassword);
    const newPasswordUnsaved = Password.create({
      uuid: uuidv4(),
      user: password.user,
      hash: newPasswordHash,
    });

    // Wait for the new password to be saved before deleting the old one
    await newPasswordUnsaved.save();
    await password.softRemove();

    return okayResponse(res);
  } catch (e) {
    return internalServerError(req, res, e as Error);
  }
}
