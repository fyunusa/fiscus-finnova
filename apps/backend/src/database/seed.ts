import { AppDataSource } from './data-source';
import { Investment } from '@modules/investments/entities/investment.entity';
import { SEED_INVESTMENTS } from '@modules/investments/seeds/investment.seed';

async function runSeeds() {
  try {
    // Initialize data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✓ Database connected');
    }

    const investmentRepository = AppDataSource.getRepository(Investment);

    // Check if investments already exist
    const existingCount = await investmentRepository.count();
    if (existingCount > 0) {
      console.log(`ℹ ${existingCount} investments already exist in database. Skipping seed.`);
      return;
    }

    // Insert seed investments
    console.log(`\nSeeding ${SEED_INVESTMENTS.length} investments...`);
    const result = await investmentRepository.save(SEED_INVESTMENTS);
    console.log(`✓ Successfully seeded ${result.length} investments`);

    // Verify the data
    const count = await investmentRepository.count();
    console.log(`✓ Total investments in database: ${count}`);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✓ Database connection closed');
    }
  }
}

// Run seeds
runSeeds();
