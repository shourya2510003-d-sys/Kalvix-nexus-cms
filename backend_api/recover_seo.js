const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching products from Firebase...');
  const fbRes = await fetch('https://divine-cardinal-default-rtdb.firebaseio.com/product_extras.json');
  const fbData = await fbRes.json();
  
  if (!fbData) {
    console.log('No data found in Firebase');
    return;
  }

  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products in database.`);

  let updatedCount = 0;

  for (const product of products) {
    const extra = fbData[product.id];
    if (extra) {
      console.log(`Updating product ${product.id} (${product.name})...`);
      
      const updateData = {};
      
      if (extra.shortDescription && !product.description) {
        updateData.description = extra.shortDescription;
      }
      
      if (extra.seoDescription && !product.summary) {
        updateData.summary = extra.seoDescription;
      }

      if (extra.howToUse && !product.howToUse) {
        updateData.howToUse = extra.howToUse;
      }

      if (extra.ingredientBreakdown && !product.keyIngredients) {
        updateData.keyIngredients = extra.ingredientBreakdown;
      }
      
      // Store full SEO metadata into seoTags
      const seoPayload = {
        title: extra.seoTitle || '',
        description: extra.seoDescription || '',
        keywords: extra.keywords || []
      };
      
      if (!product.seoTags) {
         updateData.seoTags = JSON.stringify(seoPayload);
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        });
        updatedCount++;
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} products from Firebase!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
