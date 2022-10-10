import { KeyObject } from "crypto";
import { V4 as paseto } from "paseto";
import { v4 as uuidv4 } from "uuid";
import cache from "../../lib/cache";
import { User } from "../database";
import logger from "../logger/logger";

type Config<T> = {
  pk: T;
  issuer: string;
  audience: string;
};

type SessionData = {
  userUuid: string;
  csrfToken: string;
};

const config = (() => {
  const output: Partial<Config<String>> = {};
  const missing: string[] = [];
  for (const envVar of ["KEY", "ISSUER", "AUDIENCE"]) {
    if (!process.env[`AUTH_CSRF_${envVar}`]) {
      missing.push(envVar);
    } else {
      output[envVar.toLowerCase() as keyof Config<String>] =
        process.env[`AUTH_CSRF_${envVar}`];
    }
  }

  if (missing.length > 0) {
    logger.fatal(
      `Missing AUTH_CSRF environment variables: ${missing.join(", ")}`
    );
  }

  return {
    ...output,
    pk: paseto.bytesToKeyObject(Buffer.from(output.pk!, "hex")),
  } as Config<KeyObject>;
})();

export class Session {
  sessionUuid: string;
  userUuid: string;
  csrfToken: string;

  private constructor(
    userUuid: string,
    sessionToken: string,
    csrfToken: string
  ) {
    this.sessionUuid = sessionToken;
    this.userUuid = userUuid;
    this.csrfToken = csrfToken;
  }

  public static async create(sessionToken: string, userUuid: string) {
    if (!sessionToken || !userUuid) {
      throw new Error("Missing sessionToken or userUuid");
    }

    if (await cache.has(sessionToken)) {
      throw new Error("Session already exists");
    }

    if ((await User.getByUuid(userUuid)) === null) {
      throw new Error("User does not exist");
    }

    const csrfToken = uuidv4();
    const session = new Session(sessionToken, userUuid, csrfToken);

    await cache.setex(
      sessionToken,
      JSON.stringify({ userUuid, csrfToken } as SessionData),
      12 * 60 * 60
    );

    return session;
  }

  public static async verify(
    sessionUuid: string,
    userUuid: string,
    csrfToken: string
  ) {
    const rawSession = await cache.get(sessionUuid);
    if (rawSession === null) {
      return false;
    }

    const session = JSON.parse(rawSession) as SessionData;

    return session.userUuid === userUuid && session.csrfToken === csrfToken;
  }

  public async getPASETO() {
    return paseto.sign(
      {
        sub: this.userUuid,
        csrf: this.csrfToken,
      },
      config.pk,
      {
        expiresIn: "12h",
        audience: config.audience,
        issuer: config.issuer,
      }
    );
  }
}
