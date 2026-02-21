import { AppDataSource } from './data-source';
import { User } from '@modules/users/entities/user.entity';
import { Investment } from '@modules/investments/entities/investment.entity';
import { SEED_INVESTMENTS } from '@modules/investments/seeds/investment.seed';
import { LoanProduct } from '@modules/loans/entities/loan-product.entity';
import { SEED_LOAN_PRODUCTS } from '@modules/loans/seeds/loan-product.seed';
import { createDefaultAdminUser } from '@modules/users/seeds/admin-user.seed';
import { Inquiry } from '@modules/inquiry/entities/inquiry.entity';
import { SEED_INQUIRIES } from '@modules/inquiry/seeds/inquiry.seed';

async function runSeeds() {
  try {
    // Initialize data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✓ Database connected');
    }

    const userRepository = AppDataSource.getRepository(User);
    const investmentRepository = AppDataSource.getRepository(Investment);
    const loanProductRepository = AppDataSource.getRepository(LoanProduct);
    const inquiryRepository = AppDataSource.getRepository(Inquiry);

    // Seed Default Admin User
    const adminCount = await userRepository.count({
      where: { email: 'admin@fiscus.com' },
    });
    if (adminCount === 0) {
      console.log('\nSeeding default admin user...');
      const admin = await createDefaultAdminUser();
      const savedAdmin = await userRepository.save(admin);
      console.log(`✓ Successfully created admin user: ${savedAdmin.email}`);
      console.log(`  Email: admin@fiscus.com`);
      console.log(`  Password: Admin@123456`);
      console.log(`  ⚠️  Please change the password after first login!`);
    } else {
      console.log('ℹ Admin user already exists in database. Skipping seed.');
    }

    // Seed Investments
    const investmentCount = await investmentRepository.count();
    if (investmentCount === 0) {
      console.log(`\nSeeding ${SEED_INVESTMENTS.length} investments...`);
      const investmentResult = await investmentRepository.save(SEED_INVESTMENTS);
      console.log(`✓ Successfully seeded ${investmentResult.length} investments`);
    } else {
      console.log(`ℹ ${investmentCount} investments already exist in database. Skipping seed.`);
    }

    // Seed Loan Products
    const loanProductCount = await loanProductRepository.count();
    if (loanProductCount === 0) {
      console.log(`\nSeeding ${SEED_LOAN_PRODUCTS.length} loan products...`);
      const loanResult = await loanProductRepository.save(SEED_LOAN_PRODUCTS);
      console.log(`✓ Successfully seeded ${loanResult.length} loan products`);
    } else {
      console.log(`ℹ ${loanProductCount} loan products already exist in database. Skipping seed.`);
    }

    // Verify the data
    const finalInvestmentCount = await investmentRepository.count();
    const finalLoanCount = await loanProductRepository.count();
    console.log(`\n✓ Final database state:`);
    console.log(`  - Investments: ${finalInvestmentCount}`);
    console.log(`  - Loan Products: ${finalLoanCount}`);

    // Seed Inquiries
    const inquiryCount = await inquiryRepository.count();
    if (inquiryCount === 0) {
      // Find the admin user to assign inquiries to
      const adminUser = await userRepository.findOne({ where: { email: 'admin@fiscus.com' } });
      if (adminUser) {
        console.log(`\nSeeding ${SEED_INQUIRIES.length} inquiries...`);
        const inquiriesToSave = SEED_INQUIRIES.map((seed) => {
          return inquiryRepository.create({
            subject: seed.subject,
            message: seed.message,
            category: seed.category,
            status: seed.status,
            priority: seed.priority,
            repliesCount: seed.repliesCount,
            lastReplyBy: seed.lastReplyBy,
            lastReplyAt: new Date(),
            userId: adminUser.id,
          });
        });
        const inquiryResult = await inquiryRepository.save(inquiriesToSave);
        console.log(`✓ Successfully seeded ${inquiryResult.length} inquiries`);
      } else {
        console.log('⚠ Admin user not found, skipping inquiry seed');
      }
    } else {
      console.log(`ℹ ${inquiryCount} inquiries already exist in database. Skipping seed.`);
    }

    const finalInquiryCount = await inquiryRepository.count();
    console.log(`  - Inquiries: ${finalInquiryCount}`);
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
