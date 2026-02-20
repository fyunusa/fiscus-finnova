import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifySchemaForUserToIncludeKakao1771622686729 implements MigrationInterface {
    name = 'ModifySchemaForUserToIncludeKakao1771622686729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loan_applications" DROP CONSTRAINT "FK_loan_applications_loan_account_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "kakaoId" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_55196ba714fe2e96252301cc3dd" UNIQUE ("kakaoId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profileImageUrl" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileImageUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_55196ba714fe2e96252301cc3dd"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "kakaoId"`);
        await queryRunner.query(`ALTER TABLE "loan_applications" ADD CONSTRAINT "FK_loan_applications_loan_account_id" FOREIGN KEY ("loanAccountId") REFERENCES "loan_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
