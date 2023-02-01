import { User } from "modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Farm {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public name: string;

  @ManyToOne(() => User)
  public user: User;

  @Column()
  public address: string;

  @Column({ default: 0 })
  public distance_coordinate: number;

  @Column({ default: 0 })
  public duration_coordinate: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  public size: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  public farm_yield: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
