

async function deactivateNoImageProducts() {
  const API_URL = 'http://127.0.0.1:4001/api/products?limit=1000';
  
  try {
    const res = await fetch(API_URL, {
      headers: { 'x-tenant-id': 'divine-cardinal' }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    const products = data.products || data.data || data;
    
    let deactivatedCount = 0;
    
    for (const product of products) {
      const hasWellnessCat = product.categories?.some(c => c.slug === 'wellness-category' || c.name.toLowerCase().includes('wellness'));
      const isVideoFirstImage = product.images && product.images.length > 0 && product.images[0].url.includes('.mp4');
      const hasNoImage = (!product.images || product.images.length === 0) || isVideoFirstImage;
      
      if (hasWellnessCat && hasNoImage && product.status === 'ACTIVE') {
        console.log(`Deactivating product: ${product.name} (${product.id})`);
        const patchRes = await fetch(`http://127.0.0.1:4001/api/products/${product.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': 'divine-cardinal'
          },
          body: JSON.stringify({ status: 'INACTIVE' })
        });
        
        if (patchRes.ok) {
          deactivatedCount++;
        } else {
          console.error(`Failed to deactivate ${product.id}`);
        }
      }
    }
    
    console.log(`Deactivated ${deactivatedCount} products in wellness category with no images.`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

deactivateNoImageProducts();
