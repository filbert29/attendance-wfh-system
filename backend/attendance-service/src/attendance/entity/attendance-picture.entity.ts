import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';

@Entity('ttadattendancepicture')
export class AttendancePicture {
  @PrimaryGeneratedColumn()
  seq_id: number;

  @Column()
  att_id: number;

  @Column({ length: 255 })
  pic_dic: string;

  @Column({ length: 25 })
  task: string;

  @Column({ length: 255 })
  description: string;

  @Column({ length: 100 })
  created_by: string;

  @CreateDateColumn({ type: 'datetime' })
  created_date: Date;

  @ManyToOne(() => Attendance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'att_id' })
  attendance: Attendance;
}
