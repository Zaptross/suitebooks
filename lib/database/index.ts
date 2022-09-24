import "reflect-metadata";
import { DataSource } from "typeorm";
import logger from "../logger/logger";
import { isProduction } from "../utils/env";
import Entities from "./entities";

type Config = {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
};

const getConfig: () => Config = () => {
  const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  let incomplete = false;
  for (const key in config) {
    if (config[key as keyof typeof config] === undefined) {
      logger.error(`Missing database environment variable: ${key}`);
      incomplete = true;
    }
  }

  if (incomplete) {
    logger.fatal("Missing database environment variables");
  }

  return config as Config;
};

const initialise = () => {
  const config = getConfig();

  const db = new DataSource({
    type: "postgres",
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.password,
    database: config.name,
    entities: Entities,
    synchronize: !isProduction,
    logging: ["error", "schema"],
  });

  db.initialize();
};

export * from "./entities";
