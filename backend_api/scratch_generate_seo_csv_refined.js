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
      keyIngredients: true,
      categories: {
        select: { name: true }
      }
    }
  });

  let csvContent = "Product Name,Product Slug,Suggested Keywords\n";

  for (const p of products) {
    const categoryNames = p.categories.map(c => c.name).join(' ');
    
    let keywordsArray = ["ayurvedic", "natural remedy", "divine cardinal"];
    
    const nameWords = p.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
    keywordsArray.push(p.name.toLowerCase());
    keywordsArray.push(...nameWords);
    
    const catWords = categoryNames.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 3);
    if(categoryNames) keywordsArray.push(categoryNames.toLowerCase());
    keywordsArray.push(...catWords);

    if (p.keyIngredients) {
      const ingredients = p.keyIngredients
        .replace(/ and /gi, ',')
        .replace(/&/g, ',')
        .split(',')
        .map(i => i.trim().toLowerCase())
        .filter(i => i.length > 2 && i !== 'base');
        
      for (const ing of ingredients) {
        keywordsArray.push(ing);
        if (ing.includes('essential oil')) {
           keywordsArray.push(ing.replace('essential oil', '').trim());
           keywordsArray.push(ing.replace('essential oil', 'extract').trim());
        }
      }
    }

    const uniqueKeywords = [...new Set(keywordsArray)];
    const finalKeywords = uniqueKeywords.join(', ');
    
    csvContent += `"${p.name.replace(/"/g, '""')}","${p.slug}","${finalKeywords.replace(/"/g, '""')}"\n`;
  }

  fs.writeFileSync('seo_products_list_refined.csv', csvContent);
  console.log(`Generated seo_products_list_refined.csv with ${products.length} products.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
