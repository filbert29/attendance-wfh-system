import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1770965081932 implements MigrationInterface {
    name = 'InitMigration1770965081932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tememployees\` (\`emp_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`position_name\` varchar(255) NULL, \`created_by\` varchar(100) NOT NULL, \`created_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`modified_by\` varchar(100) NOT NULL, \`modified_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`emp_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ttadattendance\` (\`att_id\` int NOT NULL AUTO_INCREMENT, \`emp_id\` int NOT NULL, \`actual_start\` datetime NULL, \`actual_end\` datetime NULL, \`att_status\` varchar(50) NULL, \`created_by\` varchar(100) NOT NULL, \`created_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`modified_by\` varchar(100) NOT NULL, \`modified_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`att_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ttadattendancerequest\` (\`req_id\` int NOT NULL AUTO_INCREMENT, \`att_id\` int NOT NULL, \`request_checkin\` datetime NULL, \`request_checkout\` datetime NULL, \`remark\` varchar(255) NULL, \`reject_reason\` varchar(255) NULL, \`status\` varchar(20) NOT NULL DEFAULT 'Waiting Approval', \`created_by\` varchar(50) NULL, \`created_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`modified_by\` varchar(50) NULL, \`modified_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`req_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ttadattendancepicture\` (\`seq_id\` int NOT NULL AUTO_INCREMENT, \`att_id\` int NOT NULL, \`pic_dic\` varchar(255) NOT NULL, \`task\` varchar(25) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_by\` varchar(100) NOT NULL, \`created_date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`seq_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`ttadattendance\` ADD CONSTRAINT \`FK_e75609469d9c042378d4725fdc2\` FOREIGN KEY (\`emp_id\`) REFERENCES \`tememployees\`(\`emp_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ttadattendancerequest\` ADD CONSTRAINT \`FK_f097a5398b79ac6c3fcd9e3bacb\` FOREIGN KEY (\`att_id\`) REFERENCES \`ttadattendance\`(\`att_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ttadattendancepicture\` ADD CONSTRAINT \`FK_c460c4d9047709d9252c77de72d\` FOREIGN KEY (\`att_id\`) REFERENCES \`ttadattendance\`(\`att_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ttadattendancepicture\` DROP FOREIGN KEY \`FK_c460c4d9047709d9252c77de72d\``);
        await queryRunner.query(`ALTER TABLE \`ttadattendancerequest\` DROP FOREIGN KEY \`FK_f097a5398b79ac6c3fcd9e3bacb\``);
        await queryRunner.query(`ALTER TABLE \`ttadattendance\` DROP FOREIGN KEY \`FK_e75609469d9c042378d4725fdc2\``);
        await queryRunner.query(`DROP TABLE \`ttadattendancepicture\``);
        await queryRunner.query(`DROP TABLE \`ttadattendancerequest\``);
        await queryRunner.query(`DROP TABLE \`ttadattendance\``);
        await queryRunner.query(`DROP TABLE \`tememployees\``);
    }

}
