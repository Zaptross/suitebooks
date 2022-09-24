import { PrimaryColumn, BaseEntity, Column, ManyToOne } from "typeorm";
import argon2 from "argon2";
import { User } from "./user";

const PEPPER = process.env.HASH_PEPPER;

export class Password extends BaseEntity {
  @PrimaryColumn()
  @ManyToOne(() => User, (user) => user.uuid)
  uuid: string;

  @Column({ type: "varchar", length: 1000 })
  hash: string;

  @PrimaryColumn()
  @Column({ type: "bigint", default: () => Date.now() })
  createdAt: number;

  @Column({ type: "bigint", nullable: true, default: null })
  deletedAt: number | null;

  constructor(
    uuid: string,
    hashedPassword: string,
    createdAt = Date.now(),
    deletedAt = null
  ) {
    super();

    Password.validateConstructorParams(
      uuid,
      hashedPassword,
      createdAt,
      deletedAt
    );

    this.uuid = uuid;
    this.hash = hashedPassword;
    this.createdAt = createdAt;
    this.deletedAt = deletedAt;
  }

  private static validateConstructorParams(
    uuid: string,
    hashedPassword: string,
    createdAt: number,
    deletedAt: number | null
  ) {
    if (!uuid || uuid.length === 0) {
      throw new Error("uuid is required");
    }

    if (
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        uuid
      )
    ) {
      throw new Error("uuid is not a valid uuid");
    }

    if (!hashedPassword || hashedPassword.length === 0) {
      throw new Error("password is required");
    }

    if (!hashedPassword.startsWith("$argon2")) {
      throw new Error("password is not hashed");
    }

    if (createdAt < 0) {
      throw new Error("createdAt is not a valid timestamp");
    }

    if (deletedAt && deletedAt < 0) {
      throw new Error("deletedAt is not a valid timestamp");
    }
  }

  public static async generatePasswordHash(password: string) {
    return await argon2.hash(password + PEPPER);
  }
}
