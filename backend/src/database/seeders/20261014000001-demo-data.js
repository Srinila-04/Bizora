import bcrypt from 'bcryptjs';

const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const OWNER_ID = '22222222-2222-2222-2222-222222222222';
const CUSTOMER_ID = '33333333-3333-3333-3333-333333333333';
const BUSINESS_ID = '44444444-4444-4444-4444-444444444444';
const CAT_1_ID = '55555555-5555-5555-5555-555555555555';
const CAT_2_ID = '66666666-6666-6666-6666-666666666666';
const PROD_1_ID = '77777777-7777-7777-7777-777777777777';
const PROD_2_ID = '88888888-8888-8888-8888-888888888888';

export const up = async (queryInterface, Sequelize, transaction) => {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const now = new Date();

  // Users
  await queryInterface.bulkInsert(
    'users',
    [
      {
        id: ADMIN_ID,
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@bizora.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: OWNER_ID,
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'owner@artisancafe.com',
        password: hashedPassword,
        role: 'business_owner',
        isEmailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: CUSTOMER_ID,
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'customer@gmail.com',
        password: hashedPassword,
        role: 'customer',
        isEmailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    { transaction, ignoreDuplicates: true }
  );

  // Business
  await queryInterface.bulkInsert(
    'businesses',
    [
      {
        id: BUSINESS_ID,
        ownerId: OWNER_ID,
        name: 'Artisan Coffee Roasters',
        slug: 'artisan-coffee-roasters',
        description: 'Single-origin specialty coffees roasted in micro-batches with love.',
        category: 'Food & Beverage',
        email: 'contact@artisancoffee.com',
        phone: '+1-555-0199',
        address: '104 Market Street, Seattle, WA 98101',
        isPublished: true,
        themeSettings: JSON.stringify({
          primaryColor: '#78350f',
          secondaryColor: '#b45309',
          font: 'Poppins',
          layout: 'modern'
        }),
        status: 'active',
        createdAt: now,
        updatedAt: now
      }
    ],
    { transaction, ignoreDuplicates: true }
  );

  // Categories
  await queryInterface.bulkInsert(
    'categories',
    [
      {
        id: CAT_1_ID,
        businessId: BUSINESS_ID,
        name: 'Whole Bean Coffee',
        slug: 'whole-bean-coffee',
        description: 'Freshly roasted single origin and signature blend beans.',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: CAT_2_ID,
        businessId: BUSINESS_ID,
        name: 'Brewing Equipment',
        slug: 'brewing-equipment',
        description: 'Professional grade pour-over and manual brewing tools.',
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    { transaction, ignoreDuplicates: true }
  );

  // Products
  await queryInterface.bulkInsert(
    'products',
    [
      {
        id: PROD_1_ID,
        businessId: BUSINESS_ID,
        categoryId: CAT_1_ID,
        name: 'Ethiopian Yirgacheffe Single Origin',
        slug: 'ethiopian-yirgacheffe-single-origin',
        description: 'Notes of bergamot, jasmine, and citrus with a honeyed finish. 12oz bag.',
        price: 19.50,
        compareAtPrice: 22.00,
        costPrice: 9.00,
        sku: 'COF-ETH-001',
        stockQuantity: 45,
        lowStockThreshold: 10,
        images: JSON.stringify(['/uploads/demo/coffee-beans.jpg']),
        isPublished: true,
        status: 'active',
        createdAt: now,
        updatedAt: now
      },
      {
        id: PROD_2_ID,
        businessId: BUSINESS_ID,
        categoryId: CAT_2_ID,
        name: 'Ceramic V60 Dripper (White)',
        slug: 'ceramic-v60-dripper-white',
        description: 'The standard for pour-over excellence. Size 02.',
        price: 26.00,
        compareAtPrice: null,
        costPrice: 12.00,
        sku: 'EQP-V60-001',
        stockQuantity: 20,
        lowStockThreshold: 5,
        images: JSON.stringify(['/uploads/demo/v60-dripper.jpg']),
        isPublished: true,
        status: 'active',
        createdAt: now,
        updatedAt: now
      }
    ],
    { transaction, ignoreDuplicates: true }
  );
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.bulkDelete('products', { id: [PROD_1_ID, PROD_2_ID] }, { transaction });
  await queryInterface.bulkDelete('categories', { id: [CAT_1_ID, CAT_2_ID] }, { transaction });
  await queryInterface.bulkDelete('businesses', { id: [BUSINESS_ID] }, { transaction });
  await queryInterface.bulkDelete('users', { id: [ADMIN_ID, OWNER_ID, CUSTOMER_ID] }, { transaction });
};

export default { up, down };

