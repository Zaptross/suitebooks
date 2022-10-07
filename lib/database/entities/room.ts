import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";

export enum RoomType {
  Pod = "pod",
  Backpacker = "backpacker",
  Hotel = "hotel",
  DoubleHotel = "double-hotel",
  Studio = "studio",
  DoubleStudio = "double-studio",
  Penthouse = "penthouse",
}

@Entity()
export class Room extends BaseEntity {
  @PrimaryColumn({ type: "uuid" })
  uuid: string;

  @Column({ type: "int" })
  id: number;

  @Column({ type: "int" })
  floor: number;

  @Column({ type: "int" })
  capacity: number;

  @Column({ type: "enum", enum: RoomType })
  type: RoomType;

  constructor(
    uuid: string,
    id: number,
    floor: number,
    capacity: number,
    type: RoomType
  ) {
    super();
    this.uuid = uuid;
    this.id = id;
    this.floor = floor;
    this.capacity = capacity;
    this.type = type;
  }
}
