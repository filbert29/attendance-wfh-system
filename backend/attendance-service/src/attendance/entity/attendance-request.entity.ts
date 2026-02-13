import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';

@Entity({ name: 'ttadattendancerequest' })
export class AttendanceRequest {
  @PrimaryGeneratedColumn()
  req_id: number;

  @Column()
  att_id: number;

  @ManyToOne(() => Attendance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'att_id' })
  attendance: Attendance;

  @Column({ type: 'datetime', nullable: true })
  request_checkin: Date;

  @Column({ type: 'datetime', nullable: true })
  request_checkout: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reject_reason: string;

  @Column({ type: 'varchar', length: 20, default: 'Waiting Approval' })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created_by: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_date: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  modified_by: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  modified_date: Date;
}
