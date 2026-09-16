require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: {
      name: true,
      slug: true,
      categories: {
        select: { name: true }
      }
    }
  });

  let csvContent = "Product Name,Product Slug,Suggested Keywords\n";

  for (const p of products) {
    const categoryNames = p.categories.map(c => c.name).join(' ');
    // Generate some basic keywords based on name
    const keywords = `${p.name}, ayurvedic, natural, ${categoryNames}`.toLowerCase().replace(/,/g, '');
    const cleanKeywords = keywords.split(' ').filter(k => k.length > 3).slice(0, 5).join(', ');
    
    csvContent += `"${p.name}","${p.slug}","${cleanKeywords}"\n`;
  }

  fs.writeFileSync('seo_products_list.csv', csvContent);
  console.log(`Generated seo_products_list.csv with ${products.length} products.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
