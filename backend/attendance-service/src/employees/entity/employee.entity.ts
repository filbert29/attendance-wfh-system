import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tememployees')
export class Employee {
  @PrimaryGeneratedColumn()
  emp_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  position_name: string;

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
