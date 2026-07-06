export function normalizeSize(value) {
  return String(value ?? "").trim().toUpperCase();
}

export function extractProductSizes(product) {
  const values = [];

  if (Array.isArray(product?.sizes)) {
    values.push(...product.sizes);
  }

  if (Array.isArray(product?.colors)) {
    product.colors.forEach((color) => {
      if (Array.isArray(color?.sizes)) {
        color.sizes.forEach((sizeItem) => {
          const sizeValue = sizeItem?.size ?? sizeItem;
          if (sizeValue !== undefined && sizeValue !== null && sizeValue !== "") {
            values.push(sizeValue);
          }
        });
      }
    });
  }

  return [...new Set(values.map(normalizeSize).filter(Boolean))];
}

export function getSizeDetails(product, selectedSize) {
  const normalizedTarget = normalizeSize(selectedSize);
  const candidates = [];

  if (Array.isArray(product?.sizeDetails) && product.sizeDetails.length) {
    candidates.push(...product.sizeDetails);
  }

  if (Array.isArray(product?.rawColors) && product.rawColors.length) {
    product.rawColors.forEach((color) => {
      if (Array.isArray(color?.sizes)) {
        color.sizes.forEach((sizeItem) => {
          const sizeValue = sizeItem?.size ?? sizeItem;
          if (sizeValue !== undefined && sizeValue !== null && sizeValue !== "") {
            candidates.push({
              size: normalizeSize(sizeValue),
              price: sizeItem?.price ?? null,
              quantity: sizeItem?.quantity ?? null,
              image: sizeItem?.image || color?.image || "",
              color: color?.name || "",
            });
          }
        });
      }
    });
  }

  if (!candidates.length && Array.isArray(product?.colors) && product.colors.length) {
    product.colors.forEach((color) => {
      if (Array.isArray(color?.sizes)) {
        color.sizes.forEach((sizeItem) => {
          const sizeValue = sizeItem?.size ?? sizeItem;
          if (sizeValue !== undefined && sizeValue !== null && sizeValue !== "") {
            candidates.push({
              size: normalizeSize(sizeValue),
              price: sizeItem?.price ?? null,
              quantity: sizeItem?.quantity ?? null,
              image: sizeItem?.image || color?.image || "",
              color: color?.name || "",
            });
          }
        });
      }
    });
  }

  return candidates.find((item) => normalizeSize(item.size) === normalizedTarget) || candidates[0] || null;
}

export function getSizeImage(product, selectedSize) {
  return getSizeDetails(product, selectedSize)?.image || product?.thumbnail || "";
}

export function hasMatchingSize(product, selectedSize) {
  const normalizedTarget = normalizeSize(selectedSize);
  if (!normalizedTarget) return false;

  return extractProductSizes(product).includes(normalizedTarget);
}

export function mapApiProduct(p) {
  if (!p) return null;
  const firstColor = p.colors?.[0] || {};
  const firstGallery = p.gallery?.[0] || {};
  const sizeDetails = (p.colors || []).flatMap((color) => (color.sizes || []).map((sizeItem) => ({
    size: normalizeSize(sizeItem?.size),
    price: parseFloat(sizeItem?.price || p.basePrice || 0),
    quantity: parseInt(sizeItem?.quantity || 0),
    image: sizeItem?.image || color?.image || "",
    color: color?.name || "",
  }))).filter((item) => item.size);
  const firstSize = sizeDetails[0] || {};
  const basePrice = parseFloat(firstSize?.price || p.basePrice || 0);
  const mrpValue = p.mrp ? parseFloat(p.mrp) : basePrice;
  const discountPercent = mrpValue > basePrice ? Math.round(((mrpValue - basePrice) / mrpValue) * 100) : 0;
  const sizeImages = sizeDetails.map((item) => item.image).filter(Boolean);
  const galleryImages = [...new Set([...(p.gallery?.map((g) => g.url) || []), ...(p.colors || []).map((c) => c.image).filter(Boolean), ...sizeImages])].filter(Boolean);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || p.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + p.id,
    description: p.description || "",
    category: p.category?.name || p.category || "",
    fabric: p.fabric || "",
    occasion: p.occasion || "",
    price: mrpValue,
    discountPrice: basePrice,
    discount: discountPercent,
    rating: 4.5,
    reviews: 0,
    sizes: sizeDetails.map((item) => item.size),
    colors: p.colors?.map((c) => ({ name: c.name, hex: c.code, image: c.image || "" })) || [],
    stock: parseInt(firstSize?.quantity || 0),
    featured: false,
    bestSeller: false,
    newArrival: p.newArrivals || false,
    images: galleryImages.length ? galleryImages : [firstColor?.image || firstGallery?.url || ""].filter(Boolean),
    thumbnail: sizeImages[0] || (p.colors || []).map((c) => c.image).filter(Boolean)[0] || firstColor?.image || firstGallery?.url || "",
    sizeDetails,
    rawColors: p.colors || [],
  };
}
