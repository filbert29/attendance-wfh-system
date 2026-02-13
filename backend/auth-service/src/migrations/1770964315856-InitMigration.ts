import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1770964315856 implements MigrationInterface {
    name = 'InitMigration1770964315856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`temusers\` (\`user_id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`user_type\` varchar(100) NOT NULL, \`created_by\` varchar(100) NOT NULL, \`created_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`modified_by\` varchar(100) NOT NULL, \`modified_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`temusers\``);
    }

}
