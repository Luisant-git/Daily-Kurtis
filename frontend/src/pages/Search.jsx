import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { PRODUCTS } from "../data/products.js";
import ProductCard from "../components/product/ProductCard";
import Empty from "../components/ui/Empty";
import Breadcrumb from "../components/ui/Breadcrumb";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const results = PRODUCTS.filter(
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
