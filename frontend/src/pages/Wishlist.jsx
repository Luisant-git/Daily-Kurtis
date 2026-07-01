import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import Empty from "../components/ui/Empty";
import Breadcrumb from "../components/ui/Breadcrumb";

export default function Wishlist() {
  const { items } = useWishlist();

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Wishlist" }]} />
          <h1 className="font-display text-3xl sm:text-4xl mt-3">My Wishlist</h1>
          <p className="text-sm text-neutral-600 mt-2">{items.length} saved pieces</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <Empty icon={<Heart size={28} />} title="Your wishlist is empty" subtitle="Tap the heart on any piece you love to save it for later." cta="Start exploring" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
