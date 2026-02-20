import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoanAccountIdToLoanApplications1771520000000 implements MigrationInterface {
    name = 'AddLoanAccountIdToLoanApplications1771520000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD "loanAccountId" uuid`);
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD CONSTRAINT "FK_loan_applications_loan_account_id" FOREIGN KEY ("loanAccountId") REFERENCES "loan_accounts"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP CONSTRAINT "FK_loan_applications_loan_account_id"`);
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP COLUMN "loanAccountId"`);
    }

}
