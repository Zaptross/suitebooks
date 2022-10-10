import logger from "../logger/logger";
import RedisCacheProvider from "./redis";

export interface CacheProvider {
  get: (key: string) => Promise<string | null>;
  setex: (key: string, value: string, seconds: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  has: (key: string) => Promise<boolean>;
}

export type Config = {
  host: string;
  port: number;
  password: string;
  provider: string;
};

const getConfig: () => Config = () => {
  const config = {
    host: process.env.CACHE_HOST,
    port: Number(process.env.CACHE_PORT),
    password: process.env.CACHE_PASSWORD,
    provider: process.env.CACHE_PROVIDER,
  };

  let incomplete = false;
  for (const key in config) {
    if (config[key as keyof typeof config] === undefined) {
      logger.error(`Missing cache environment variable: ${key}`);
      incomplete = true;
    }
  }

  if (incomplete) {
    logger.fatal("Missing cache environment variables");
  }

  return config as Config;
};

function getCacheProvider(): CacheProvider {
  const config = getConfig();
  switch (config.provider) {
    case "redis":
      return new RedisCacheProvider(config);
    default:
      logger.fatal(`Unknown cache provider: ${process.env.CACHE_PROVIDER}`);
      throw new Error("Unknown cache provider");
  }
}

export default getCacheProvider();
