import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRetailers() {
  console.log('Seeding retailers...');

  const retailers = [
    {
      slug: 'checkers',
      name: 'Checkers',
      displayName: 'Checkers Sixty60',
      logoUrl: '/logos/checkers.svg',
      brandColor: '#00A859',
      websiteUrl: 'https://www.checkers.co.za',
      supportEmail: 'customercare@checkers.co.za',
      isActive: true,
      isVisible: true,
    },
    {
      slug: 'pick-n-pay',
      name: 'Pick n Pay',
      displayName: 'Pick n Pay asap!',
      logoUrl: '/logos/pnp.svg',
      brandColor: '#E31E24',
      websiteUrl: 'https://www.pnp.co.za',
      supportEmail: 'customer.service@pnp.co.za',
      isActive: true,
      isVisible: true,
    },
    {
      slug: 'shoprite',
      name: 'Shoprite',
      displayName: 'Shoprite',
      logoUrl: '/logos/shoprite.svg',
      brandColor: '#ED1C24',
      websiteUrl: 'https://www.shoprite.co.za',
      supportEmail: 'customercare@shoprite.co.za',
      isActive: true,
      isVisible: true,
    },
    {
      slug: 'woolworths',
      name: 'Woolworths',
      displayName: 'Woolworths Food',
      logoUrl: '/logos/woolworths.svg',
      brandColor: '#006F3A',
      websiteUrl: 'https://www.woolworths.co.za',
      supportEmail: 'customerservice@woolworths.co.za',
      isActive: true,
      isVisible: true,
    },
    {
      slug: 'makro',
      name: 'Makro',
      displayName: 'Makro',
      logoUrl: '/logos/makro.svg',
      brandColor: '#003DA5',
      websiteUrl: 'https://www.makro.co.za',
      supportEmail: 'customerservice@makro.co.za',
      isActive: true,
      isVisible: true,
    },
  ];

  for (const retailer of retailers) {
    await prisma.retailer.upsert({
      where: { slug: retailer.slug },
      update: retailer,
      create: retailer,
    });
    console.log(`  ✓ Upserted retailer: ${retailer.name}`);
  }

  console.log('✓ Retailers seeded successfully\n');
}

async function seedIngestionConfigs() {
  console.log('Seeding ingestion configs...');

  // Get Checkers retailer
  const checkersRetailer = await prisma.retailer.findUnique({
    where: { slug: 'checkers' },
  });

  if (!checkersRetailer) {
    console.log('  ⚠ Checkers retailer not found, skipping ingestion config seed');
    return;
  }

  const ingestionConfig = {
    strategy: 'SCRAPER' as const,
    config: {
      url: 'https://www.sixty60.co.za/products',
      selectors: {
        productContainer: '.product-card',
        name: '.product-name',
        price: '.product-price',
        inStock: '.stock-status',
        image: '.product-image img',
      },
    },
    cadence: '0 */6 * * *', // Every 6 hours
    isActive: false, // Disabled by default for safety
    retailerId: checkersRetailer.id,
  };

  // Check if config already exists
  const existingConfig = await prisma.retailerIngestionConfig.findFirst({
    where: {
      retailerId: checkersRetailer.id,
      strategy: ingestionConfig.strategy,
    },
  });

  if (existingConfig) {
    await prisma.retailerIngestionConfig.update({
      where: { id: existingConfig.id },
      data: ingestionConfig,
    });
  } else {
    await prisma.retailerIngestionConfig.create({
      data: ingestionConfig,
    });
  }

  console.log(`  ✓ Upserted ingestion config for ${checkersRetailer.name}`);
  console.log('✓ Ingestion configs seeded successfully\n');
}

async function main() {
  try {
    await seedRetailers();
    await seedIngestionConfigs();
    console.log('🌱 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
