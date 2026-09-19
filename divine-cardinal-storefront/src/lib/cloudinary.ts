/**
 * Helper to optimize Cloudinary URLs by adding f_auto (format), q_auto (quality), and width transformations.
 * This dramatically reduces image sizes (e.g., from 10MB to 50KB) and ensures instant loading.
 */
export function optimizeCloudinaryUrl(url: string | null | undefined, width: number = 800, enhance: boolean = false): string {
  if (!url) return '';
  
  // Only optimize Cloudinary image URLs
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    const transformations = enhance 
      ? `f_auto,q_auto:best,e_improve,e_sharpen,w_${width},c_limit`
      : `f_auto,q_auto,w_${width}`;

    // If it already has transformations, we strip them if enhance is true, 
    // or return as-is if enhance is false.
    if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) {
      if (!enhance) return url;
      // Strip existing f_auto/q_auto transformations and insert ours
      return url.replace(/\/image\/upload\/([a-zA-Z0-9_:,]+\/)?/, `/image/upload/${transformations}/`);
    }

    return url.replace('/image/upload/', `/image/upload/${transformations}/`);
  }
  
  return url;
}
