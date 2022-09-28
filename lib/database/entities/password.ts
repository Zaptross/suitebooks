import {
  PrimaryColumn,
  BaseEntity,
  Column,
  JoinColumn,
  Entity,
  ManyToOne,
} from "typeorm";
import argon2 from "argon2";
import { User } from "./user";

const PEPPER = process.env.HASH_PEPPER;

@Entity()
export class Password extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "userUuid", referencedColumnName: "uuid" })
  user: User;

  @PrimaryColumn({ type: "bigint" })
  createdAt: number;

  @Column({ type: "bigint", nullable: true, default: null })
  deletedAt: number | null;

  @Column({ type: "varchar", length: 1000 })
  hash: string;

  public static async hash(password: string) {
    return await argon2.hash(password + PEPPER);
  }

  public async verify(password: string) {
    return await argon2.verify(this.hash, password + PEPPER);
  }

  public static async getForUser(user: User) {
    return await this.createQueryBuilder("password")
      .where("password.userUuid = :userUuid", { userUuid: user.uuid })
      .andWhere("password.deletedAt IS NULL")
      .getOne();
  }
}
