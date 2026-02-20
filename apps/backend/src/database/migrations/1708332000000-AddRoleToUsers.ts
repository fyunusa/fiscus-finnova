import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRoleToUsers1708332000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('users');
    const hasRoleColumn = table?.columns.some((col) => col.name === 'role');

    if (!hasRoleColumn) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'role',
          type: 'enum',
          enum: ['user', 'admin'],
          default: "'user'",
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'role');
  }
}
