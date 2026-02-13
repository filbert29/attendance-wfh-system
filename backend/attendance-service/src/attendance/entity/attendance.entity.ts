import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from 'src/employees/entity/employee.entity';

@Entity('ttadattendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  att_id: number;

  @Column({ type: 'int' })
  emp_id: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'emp_id' })
  employee: Employee;

  @Column({ type: 'datetime', nullable: true })
  actual_start: Date | null;

  @Column({ type: 'datetime', nullable: true })
  actual_end: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  att_status: string | null;

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
