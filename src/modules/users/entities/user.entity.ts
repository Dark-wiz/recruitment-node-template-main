import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public address: string;

  @Column({type: "decimal", precision: 10, scale: 2, default: 0})
  public latitude_coordinate: number;

  @Column({type: "decimal", precision: 10, scale: 2, default: 0})
  public longitude_coordinate: number;

  @Column()
  public hashedPassword: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
