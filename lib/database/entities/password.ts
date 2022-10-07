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

  public static checkFailedPasswordRules(password: string): string[] {
    const reasons: string[] = [];

    if (password.length < 8) {
      reasons.push("Password must be at least 8 characters");
    }

    if (password.length >= 1000) {
      reasons.push("Password must be at most 1000 characters");
    }

    if (!/[a-z]/.test(password)) {
      reasons.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      reasons.push("Password must contain at least one uppercase letter");
    }

    if (!/[0-9]/.test(password)) {
      reasons.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      reasons.push("Password must contain at least one special character");
    }

    return reasons;
  }

  public static async hash(password: string) {
    return await argon2.hash(password + PEPPER);
  }

  public async verify(password: string) {
    return await argon2.verify(this.hash, password + PEPPER);
  }

  public static async getForUser(userUuid: string) {
    return await this.createQueryBuilder("password")
      .where("password.userUuid = :userUuid", { userUuid })
      .leftJoinAndSelect("password.user", "user")
      .andWhere("password.deletedAt IS NULL")
      .getOne();
  }
}
