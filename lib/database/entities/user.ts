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

  constructor(
    uuid: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string
  ) {
    super();
    this.uuid = uuid;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
  }

  public get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
