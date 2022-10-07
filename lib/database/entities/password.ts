import {
  PrimaryColumn,
  BaseEntity,
  Column,
  JoinColumn,
  Entity,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import argon2 from "argon2";
import { User } from "./user";

const PEPPER = process.env.HASH_PEPPER;

@Entity()
export class Password extends BaseEntity {
  @PrimaryColumn({ type: "uuid" })
  uuid: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: "userUuid",
    referencedColumnName: "uuid",
    foreignKeyConstraintName: "fk_password_user_uuid",
  })
  user: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true, default: null })
  deletedAt: Date;

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
