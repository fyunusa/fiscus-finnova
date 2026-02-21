import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifySchemaForUserToInquiry1771663481822 implements MigrationInterface {
    name = 'ModifySchemaForUserToInquiry1771663481822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inquiry_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "isAdminReply" boolean NOT NULL DEFAULT false, "inquiryId" uuid NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd93fd2bde44f21d8a3f735731f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."inquiries_category_enum" AS ENUM('account', 'investment', 'loan', 'technical', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."inquiries_status_enum" AS ENUM('open', 'pending', 'closed')`);
        await queryRunner.query(`CREATE TYPE "public"."inquiries_priority_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TABLE "inquiries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject" character varying NOT NULL, "message" text NOT NULL, "category" "public"."inquiries_category_enum" NOT NULL DEFAULT 'other', "status" "public"."inquiries_status_enum" NOT NULL DEFAULT 'open', "priority" "public"."inquiries_priority_enum" NOT NULL DEFAULT 'medium', "repliesCount" integer NOT NULL DEFAULT '0', "lastReplyAt" TIMESTAMP, "lastReplyBy" character varying, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ceacaa439988b25eb9459e694d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inquiry_comments" ADD CONSTRAINT "FK_a3e8ac845e808616ac98ccdce17" FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inquiry_comments" ADD CONSTRAINT "FK_1905a143d08e37dd96a258e0c40" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inquiries" ADD CONSTRAINT "FK_f4e1f635f2d312e6ae95c8a3a58" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inquiries" DROP CONSTRAINT "FK_f4e1f635f2d312e6ae95c8a3a58"`);
        await queryRunner.query(`ALTER TABLE "inquiry_comments" DROP CONSTRAINT "FK_1905a143d08e37dd96a258e0c40"`);
        await queryRunner.query(`ALTER TABLE "inquiry_comments" DROP CONSTRAINT "FK_a3e8ac845e808616ac98ccdce17"`);
        await queryRunner.query(`DROP TABLE "inquiries"`);
        await queryRunner.query(`DROP TYPE "public"."inquiries_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."inquiries_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."inquiries_category_enum"`);
        await queryRunner.query(`DROP TABLE "inquiry_comments"`);
    }

}
