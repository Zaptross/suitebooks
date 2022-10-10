import {
  Entity,
  BaseEntity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserType {
  GUEST,
  STAFF,
  MANAGER,
  ADMIN,
}

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn({ type: "uuid", unique: true })
  uuid: string;

  @Column({ type: "varchar", length: 255 })
  firstName: string;

  @Column({ type: "varchar", length: 255 })
  lastName: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, unique: true })
  phoneNumber: string;

  @Column({ type: "enum", enum: UserType, default: UserType.GUEST })
  type: UserType;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", nullable: true, default: null })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true, default: null })
  deletedAt: Date;

  @Column({ type: "timestamptz", nullable: true, default: null })
  verified: Date;

  public get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  public static async exists(email: string, phoneNumber: string) {
    const user = await this.createQueryBuilder("user")
      .where("user.email = :email", { email })
      .orWhere("user.phoneNumber = :phoneNumber", { phoneNumber })
      .getOne();

    return {
      uuid: user?.uuid,
      email: user?.email === email,
      phoneNumber: user?.phoneNumber === phoneNumber,
    };
  }

  public static async getByEmail(email: string) {
    return await this.createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
  }

  public static async getByPhoneNumber(phoneNumber: string) {
    return await this.createQueryBuilder("user")
      .where("user.phoneNumber = :phoneNumber", { phoneNumber })
      .getOne();
  }

  public static async getByUuid(uuid: string) {
    return await this.createQueryBuilder("user")
      .where("user.uuid = :uuid", { uuid })
      .getOne();
  }
}
