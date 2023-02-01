import { MigrationInterface, QueryRunner } from "typeorm";

export class renameField1675255980913 implements MigrationInterface {
    name = 'renameField1675255980913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "farm" RENAME COLUMN "farmYield" TO "farm_yield"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "farm" RENAME COLUMN "farm_yield" TO "farmYield"`);
    }

}
