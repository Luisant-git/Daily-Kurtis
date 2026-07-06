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
