import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchemaForEmailSmsVerify1771343831196 implements MigrationInterface {
    name = 'CreateSchemaForEmailSmsVerify1771343831196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."phone_verifications_purpose_enum" AS ENUM('signup', 'password_reset', 'phone_change')`);
        await queryRunner.query(`CREATE TABLE "phone_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phoneNumber" character varying NOT NULL, "code" character varying NOT NULL, "purpose" "public"."phone_verifications_purpose_enum" NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "verifiedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_11ef2c1c5ed828b9636472db666" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae7387aa792587604c9afda13f" ON "phone_verifications" ("phoneNumber", "purpose", "verifiedAt") `);
        await queryRunner.query(`CREATE TABLE "password_reset_otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "otp" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_0b4f4c493a1ee383f93ff3a5017" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."email_verifications_purpose_enum" AS ENUM('signup', 'password_reset', 'email_change')`);
        await queryRunner.query(`CREATE TABLE "email_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "code" character varying NOT NULL, "purpose" "public"."email_verifications_purpose_enum" NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "verifiedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_c1ea2921e767f83cd44c0af203f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3dfb780f06510045f5475e2ab9" ON "email_verifications" ("email", "purpose", "verifiedAt") `);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD CONSTRAINT "FK_fa1c57ee80361406a174c1a530f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_reset_otps" ADD CONSTRAINT "FK_af2bd00dd6eef12fe6c3a150f0a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD CONSTRAINT "FK_4e63a91e0a684b31496bd50733e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP CONSTRAINT "FK_4e63a91e0a684b31496bd50733e"`);
        await queryRunner.query(`ALTER TABLE "password_reset_otps" DROP CONSTRAINT "FK_af2bd00dd6eef12fe6c3a150f0a"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP CONSTRAINT "FK_fa1c57ee80361406a174c1a530f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3dfb780f06510045f5475e2ab9"`);
        await queryRunner.query(`DROP TABLE "email_verifications"`);
        await queryRunner.query(`DROP TYPE "public"."email_verifications_purpose_enum"`);
        await queryRunner.query(`DROP TABLE "password_reset_otps"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae7387aa792587604c9afda13f"`);
        await queryRunner.query(`DROP TABLE "phone_verifications"`);
        await queryRunner.query(`DROP TYPE "public"."phone_verifications_purpose_enum"`);
    }

}
