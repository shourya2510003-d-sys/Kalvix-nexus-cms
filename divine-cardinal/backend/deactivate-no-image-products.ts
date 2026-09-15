import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { images: true }
  });

  let count = 0;
  for (const product of products) {
    if (product.images.length === 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: { status: 'DRAFT' }
      });
      count++;
    }
  }

  console.log(`Deactivated ${count} products with no images.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
