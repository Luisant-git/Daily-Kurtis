import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { productApi } from "../api/product.js";
import ProductCard from "../components/product/ProductCard";
import Empty from "../components/ui/Empty";
import Breadcrumb from "../components/ui/Breadcrumb";

function mapApiProduct(p) {
  const firstColor = p.colors?.[0] || {};
  const firstSize = firstColor?.sizes?.[0] || {};
  const firstGallery = p.gallery?.[0] || {};
  const basePrice = parseFloat(firstSize?.price || p.basePrice || 0);
  const mrpValue = p.mrp ? parseFloat(p.mrp) : basePrice;
  const discountPercent = mrpValue > basePrice ? Math.round(((mrpValue - basePrice) / mrpValue) * 100) : 0;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || p.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + p.id,
    description: p.description || "",
    category: p.category?.name || "",
    fabric: p.fabric || "",
    occasion: p.occasion || "",
    price: mrpValue,
    discountPrice: basePrice,
    discount: discountPercent,
    rating: 4.5,
    reviews: 0,
    sizes: firstColor?.sizes?.map((s) => s.size) || [],
    colors: p.colors?.map((c) => ({ name: c.name, hex: c.code })) || [],
    stock: parseInt(firstSize?.quantity || 0),
    featured: false,
    bestSeller: false,
    newArrival: p.newArrivals || false,
    images: p.gallery?.map((g) => g.url) || (firstColor?.image ? [firstColor.image] : []),
    thumbnail: firstColor?.image || firstGallery?.url || "",
  };
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const q = params.get("q") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await productApi.getActiveProducts();
        if (productData && productData.length > 0) {
          setAllProducts(productData.map(mapApiProduct));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  const results = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase()) ||
      p.fabric.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Search" }]} />
          <h1 className="font-display text-3xl sm:text-4xl mt-3">
            {q ? <>Results for "<span className="italic">{q}</span>"</> : "Search"}
          </h1>
          <p className="text-sm text-neutral-600 mt-2">{results.length} pieces found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {results.length === 0 ? (
          <Empty icon={<SearchIcon size={28} />} title="No matches" subtitle="Try a different keyword." cta="Browse all" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
