import { setCookie } from "cookies-next";
import { Password, User } from "../../lib/database";
import logger from "../../lib/logger/logger";
import { Session } from "../../lib/sessions";
import {
  APIRequest,
  APIResponse,
  badRequest,
  createSessionCookie,
  internalServerError,
} from "../../lib/utils/api";
import { isEmailValid } from "../../lib/utils/validation";

type LoginRequestParams = {
  email: string;
  password: string;
  // TODO - maybe add OTP support
};

type LoginResponseJson = {
  token: string;
  // TODO - add permissions to this response
};

export default function (req: APIRequest, res: APIResponse<LoginResponseJson>) {
  switch (req.method) {
    case "POST":
      return postLogin(...([req, res] as Parameters<typeof postLogin>));
    default:
      res.status(405).json({ error: "Method not allowed" });
  }
}

async function postLogin(
  req: APIRequest<LoginRequestParams>,
  res: APIResponse<LoginResponseJson>
) {
  try {
    if (!req.body.email || !req.body.password) {
      return badRequest(res, new Error("Missing email or password"));
    }

    const { email, password } = req.body;

    if (!isEmailValid(email)) {
      return badRequest(res, new Error("Invalid email"));
    }

    if (Password.checkFailedPasswordRules(password).length > 0) {
      return badRequest(res, new Error("Invalid password"));
    }

    const user = await User.getByEmail(email);

    if (!user) {
      return badRequest(res, new Error("Incorrect email or password"));
    }

    const storedPassword = await Password.getForUser(user.uuid);

    if (!storedPassword) {
      logger.error(`No password found for user ${user.uuid}`);
      return badRequest(res, new Error("Bad request"));
    }

    if (!(await storedPassword.verify(password))) {
      return badRequest(res, new Error("Incorrect email or password"));
    }

    let cookie = req.cookies.id;
    if (!cookie) {
      const { id, ...settings } = createSessionCookie();
      setCookie("id", id, {
        req,
        res,
        ...settings,
      });

      cookie = id;
    }

    const session = await Session.create(cookie, user.uuid);

    res.status(200).json({ token: await session.getPASETO() });
  } catch (e) {
    return internalServerError(req, res, e as Error);
  }
}
