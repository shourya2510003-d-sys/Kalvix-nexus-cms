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

  let tsvContent = "Product Name\tProduct Slug\tSuggested Keywords\n";

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
    
    // Use \t for TSV instead of commas, and we don't necessarily need quotes unless there are tabs in the data
    // but just to be safe we can still quote strings. However, pure \t works best for copy paste.
    tsvContent += `${p.name.replace(/\t|\n/g, ' ')}\t${p.slug}\t${finalKeywords.replace(/\t|\n/g, ' ')}\n`;
  }

  fs.writeFileSync('seo_products_list.tsv', tsvContent);
  console.log(`Generated seo_products_list.tsv with ${products.length} products.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
