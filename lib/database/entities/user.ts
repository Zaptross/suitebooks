import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";

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

  @Column({ type: "boolean", default: false })
  verified: boolean;

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
}
