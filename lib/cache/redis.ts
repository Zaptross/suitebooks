import Redis from "ioredis";
import { CacheProvider, Config } from "./index";

export default class RedisCacheProvider implements CacheProvider {
  private client: Redis;

  constructor(config: Config) {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
    });
  }

  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public async setex(
    key: string,
    value: string,
    seconds: number
  ): Promise<void> {
    await this.client.setex(key, seconds, value);
  }

  public async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async has(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }
}
