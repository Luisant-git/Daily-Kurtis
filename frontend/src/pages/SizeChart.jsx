import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { productApi } from "../api/product.js";
import Breadcrumb from "../components/ui/Breadcrumb";

export default function SizeChart() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sizeChartUrl, setSizeChartUrl] = useState(null);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSizeChart = async () => {
      const state = location.state;
      if (state?.sizeChartUrl) {
        setSizeChartUrl(state.sizeChartUrl);
        setProductName(state.productName || "");
        setLoading(false);
        return;
      }

      if (slug) {
        const parts = slug.split("-");
        const lastPart = parts[parts.length - 1];
        const id = parseInt(lastPart);
        if (!isNaN(id)) {
          try {
            const apiProduct = await productApi.getProductById(id);
            if (apiProduct) {
              const chartUrl = apiProduct.category?.sizeChart || apiProduct.subCategory?.sizeChart;
              if (chartUrl) {
                setSizeChartUrl(chartUrl);
                setProductName(apiProduct.name);
              }
            }
          } catch (err) {
            console.error("Failed to load product:", err);
          }
        }
      }
      setLoading(false);
    };
    loadSizeChart();
  }, [slug, location.state]);

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E9E5E5] hover:border-[#800000] transition-colors bg-white"
            >
              <ArrowLeft size={15} className="text-[#1c1c1c]" />
            </button>
            <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Size Chart" }]} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3">Size Chart</h1>
          {productName && (
            <p className="text-sm text-neutral-600 mt-3 max-w-xl">{productName}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sizeChartUrl ? (
          <div className="bg-white rounded-2xl border border-[#E9E5E5] p-6 sm:p-10">
            <div className="flex justify-center">
              <img
                src={sizeChartUrl}
                alt="Size Chart"
                className="w-full h-auto max-w-2xl rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-sm">No size chart available for this product.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-sm text-[#800000] hover:underline"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}