import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, SlidersHorizontal, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, CATEGORY_LIST, FABRIC_LIST, COLOR_LIST, SIZE_LIST, OCCASION_LIST } from "../data/products.js";
import ProductCard from "../components/product/ProductCard";
import Breadcrumb from "../components/ui/Breadcrumb";
import Empty from "../components/ui/Empty";

const PAGE_SIZE = 9;
const SORTS = [
  { value: "popular", label: "Popularity" },
  { value: "new", label: "Newest" },
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const initialCategory = params.get("category") || "";
  const initialOccasion = params.get("occasion") || "";
  const initialQuery = params.get("q") || "";
  const initialFilter = params.get("filter") || "";
  const initialSize = params.get("size") || "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory ? [initialCategory] : []);
  const [fabric, setFabric] = useState([]);
  const [color, setColor] = useState([]);
  const [size, setSize] = useState([]);
  const [occasion, setOccasion] = useState(initialOccasion ? [initialOccasion] : []);
  const [price, setPrice] = useState(6000);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync URL parameters to state
  useEffect(() => {
    if (initialFilter) setSort(initialFilter === "new" ? "new" : "popular");
  }, [initialFilter]);

  useEffect(() => {
    if (initialSize && !size.includes(initialSize)) {
      setSize([initialSize]);
    }
  }, [initialSize]);

  const filtered = useMemo(() => {
    let list = PRODUCTS.slice();
    if (initialFilter === "new") list = list.filter((p) => p.newArrival);
    if (initialFilter === "bestseller") list = list.filter((p) => p.bestSeller);
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    if (category.length) list = list.filter((p) => category.includes(p.category));
    if (fabric.length) list = list.filter((p) => fabric.includes(p.fabric));
    if (occasion.length) list = list.filter((p) => occasion.includes(p.occasion));
    if (size.length) list = list.filter((p) => p.sizes.some((s) => size.includes(s)));
    if (color.length) list = list.filter((p) => p.colors.some((c) => color.includes(c.name)));
    list = list.filter((p) => p.discountPrice <= price);
    switch (sort) {
      case "low": list.sort((a, b) => a.discountPrice - b.discountPrice); break;
      case "high": list.sort((a, b) => b.discountPrice - a.discountPrice); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "new": list.sort((a, b) => Number(b.newArrival) - Number(a.newArrival)); break;
    }
    return list;
  }, [query, category, fabric, color, size, occasion, price, sort, initialFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, category, fabric, color, size, occasion, price]);

  const clearAll = () => {
    setQuery(""); setCategory([]); setFabric([]); setColor([]); setSize([]); setOccasion([]); setPrice(6000);
    setParams({});
  };

  const Sidebar = (
    <div className="space-y-7">
      <FilterBlock title="Search">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search kurthis…"
            className="w-full h-10 pl-9 pr-3 rounded-full bg-[#FAF6F4] border border-[#E9E5E5] text-sm outline-none focus:border-[#800000]"
          />
        </div>
      </FilterBlock>

      <FilterBlock title="Category">
        {CATEGORY_LIST.map((c) => (
          <CheckRow key={c} label={c} checked={category.includes(c)} onChange={() => toggle(category, setCategory, c)} />
        ))}
      </FilterBlock>

      <FilterBlock title="Price">
        <input
          type="range" min={500} max={6000} step={100} value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full accent-[#800000]"
        />
        <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
          <span>₹500</span>
          <span className="font-medium text-[#800000]">Up to ₹{price.toLocaleString("en-IN")}</span>
        </div>
      </FilterBlock>

      <FilterBlock title="Fabric">
        <div className="grid grid-cols-2 gap-2">
          {FABRIC_LIST.map((f) => (
            <Chip key={f} active={fabric.includes(f)} onClick={() => toggle(fabric, setFabric, f)}>{f}</Chip>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZE_LIST.map((s) => (
            <Chip key={s} active={size.includes(s)} onClick={() => toggle(size, setSize, s)} small>{s}</Chip>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Color">
        <div className="flex flex-wrap gap-2">
          {COLOR_LIST.map((c) => (
            <button
              key={c.name}
              onClick={() => toggle(color, setColor, c.name)}
              title={c.name}
              className={`w-8 h-8 rounded-full border-2 transition ${
                color.includes(c.name) ? "border-[#800000] scale-110" : "border-[#E9E5E5]"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Occasion">
        <div className="grid grid-cols-2 gap-2">
          {OCCASION_LIST.map((o) => (
            <Chip key={o} active={occasion.includes(o)} onClick={() => toggle(occasion, setOccasion, o)}>{o}</Chip>
          ))}
        </div>
      </FilterBlock>

      <button onClick={clearAll} className="text-xs text-[#800000] underline">Clear all filters</button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {
            (() => {
              const crumbs = [{ label: "Home", to: "/" }];
              if (initialFilter === "new") crumbs.push({ label: "New Arrivals" });
              else if (initialFilter === "bestseller") crumbs.push({ label: "Top Selling" });
              else if (initialCategory) crumbs.push({ label: initialCategory });
              else if (initialSize) crumbs.push({ label: `Size: ${initialSize}` });
              else if (initialOccasion) crumbs.push({ label: initialOccasion });
              else crumbs.push({ label: "Collection" });
              return <Breadcrumb items={crumbs} />;
            })()
          }
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#1c1c1c]">Our Collection</h1>
              <p className="text-sm text-neutral-600 mt-2 max-w-xl">
                Discover handpicked kurthis crafted from premium fabrics — designed for every mood, occasion and season.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500">{filtered.length} items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block sticky top-28 self-start max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium mb-4 flex items-center gap-2">
            <SlidersHorizontal size={12} /> Refine Results
          </p>
          {Sidebar}
        </aside>

        {/* Main */}
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              className="lg:hidden inline-flex items-center gap-2 px-4 h-10 rounded-full border border-[#E9E5E5] text-sm"
              onClick={() => setMobileOpen(true)}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <div className="hidden lg:block text-xs text-neutral-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none h-10 pl-4 pr-10 rounded-full border border-[#E9E5E5] bg-white text-sm outline-none focus:border-[#800000]"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>Sort: {s.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
            </div>
          </div>

          {/* Grid */}
          {paged.length === 0 ? (
            <Empty title="No products found" subtitle="Try clearing filters or searching again." cta="Reset Filters" ctaTo="/shop" />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paged.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-10 w-10 rounded-full border border-[#E9E5E5] flex items-center justify-center text-sm disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-10 w-10 rounded-full text-sm ${
                    page === i + 1
                      ? "bg-[#800000] text-white"
                      : "border border-[#E9E5E5] hover:border-[#800000]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-10 w-10 rounded-full border border-[#E9E5E5] flex items-center justify-center text-sm disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-[88%] max-w-sm bg-white z-50 flex flex-col"
            >
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-display text-xl">Filters</h3>
                <button onClick={() => setMobileOpen(false)}><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{Sidebar}</div>
              <div className="p-4 border-t">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full h-12 rounded-full bg-[#800000] text-white text-sm uppercase tracking-wider"
                >
                  Show {filtered.length} results
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function toggle(arr, setter, val) {
  setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
}

function FilterBlock({ title, children }) {
  return (
    <div className="border-b border-[#E9E5E5] pb-6 last:border-b-0">
      <h4 className="text-sm font-display text-[#1c1c1c] mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer text-sm text-neutral-700 hover:text-[#800000]">
      <input
        type="checkbox" checked={checked} onChange={onChange}
        className="w-4 h-4 accent-[#800000]"
      />
      {label}
    </label>
  );
}

function Chip({ active, onClick, children, small }) {
  return (
    <button
      onClick={onClick}
      className={`${small ? "h-9 w-11 text-xs" : "h-9 px-3 text-xs"} rounded-full border transition ${
        active ? "bg-[#800000] text-white border-[#800000]" : "bg-white border-[#E9E5E5] text-neutral-700 hover:border-[#800000]"
      }`}
    >
      {children}
    </button>
  );
}
