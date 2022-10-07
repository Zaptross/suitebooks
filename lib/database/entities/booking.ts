import {
  Column,
  JoinColumn,
  ManyToOne,
  BaseEntity,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
} from "typeorm";
import { User } from "./user";
import { Room } from "./room";

// TODO - create a view later for checking if any room is available for a given time

@Entity()
export class Booking extends BaseEntity {
  @PrimaryColumn({ type: "uuid" })
  uuid: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: "userUuid",
    referencedColumnName: "uuid",
    foreignKeyConstraintName: "fk_booking_for_user",
  })
  user: User;

  @PrimaryColumn({ type: "uuid" })
  @ManyToOne(() => Room)
  @JoinColumn({
    name: "roomUuid",
    referencedColumnName: "uuid",
    foreignKeyConstraintName: "fk_booking_room_uuid",
  })
  room: Room;

  @ManyToOne(() => User)
  @JoinColumn({
    name: "bookedbyUuid",
    referencedColumnName: "uuid",
    foreignKeyConstraintName: "fk_booking_by_user",
  })
  bookedBy: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", nullable: true, default: null })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true, default: null })
  deletedAt: Date;

  @Column({ type: "timestamptz" })
  checkInAt: Date;

  @Column({ type: "timestamptz" })
  checkOutAt: Date;
}
