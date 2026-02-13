import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'temusers' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'user_type', length: 100 })
  type: string;

  @Column({ type: 'varchar', length: 100 })
  created_by: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_date: Date;

  @Column({ type: 'varchar', length: 100 })
  modified_by: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  modified_date: Date;
}
