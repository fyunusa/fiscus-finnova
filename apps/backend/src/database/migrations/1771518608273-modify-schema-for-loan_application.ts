import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifySchemaForLoanApplication1771518608273 implements MigrationInterface {
    name = 'ModifySchemaForLoanApplication1771518608273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP COLUMN "requested_loan_period"`);
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP COLUMN "requested_interest_rate"`);
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD "requestedLoanPeriod" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD "requestedInterestRate" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP COLUMN "requestedInterestRate"`);
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP COLUMN "requestedLoanPeriod"`);
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD "requested_interest_rate" double precision`);
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD "requested_loan_period" integer NOT NULL DEFAULT '12'`);
    }

}
