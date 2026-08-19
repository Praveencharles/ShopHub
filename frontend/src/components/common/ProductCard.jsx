import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart, FiShoppingCart, FiEye } from "react-icons/fi";
import { addToCart } from "../../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/slices/wishlistSlice";
import { formatCurrency, getProductImageUrl } from "../../utils/helpers";

const ProductCard = ({ product, mobileCompact }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const isInWishlist = wishlistItems.some(
    (item) => item.product?.id === product.id || item.product_id === product.id,
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product_id: product.id, quantity: 1 }));
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product.id));
    }
  };

  if (mobileCompact) {
    return (
      <div className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
        <Link to={`/shop/${product.slug}`} className="block relative">
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={getProductImageUrl(product)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {product.discount_percentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{product.discount_percentage}%
            </div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium">Out of Stock</span>
            </div>
          )}
        </Link>
        <div className="flex flex-col flex-1 p-3">
          <Link to={`/shop/${product.slug}`}>
            <h3 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2rem]">
              {product.name}
            </h3>
          </Link>
          <div className="mt-auto pt-2">
            <div className="flex items-baseline gap-1.5">
              {product.discount_price ? (
                <>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(product.effective_price)}</span>
                  <span className="text-[10px] text-gray-400 line-through">{formatCurrency(product.price)}</span>
                </>
              ) : (
                <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="mt-2 w-full py-2 bg-primary-600 text-white rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart size={12} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-100 transition-all duration-300 overflow-hidden">
      <Link to={`/shop/${product.slug}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={getProductImageUrl(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {product.discount_percentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{product.discount_percentage}%
          </div>
        )}

        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-1.5 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlistToggle}
            aria-label="Toggle wishlist"
            className={`p-2.5 rounded-full shadow-md transition-all ${
              isInWishlist
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 hover:text-red-500"
            }`}
          >
            <FiHeart className={isInWishlist ? "fill-current" : ""} size={16} />
          </button>

          {/* Replaced nested Link with div */}
          <div className="p-2.5 bg-white rounded-full shadow-md text-gray-600">
            <FiEye size={16} />
          </div>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <Link
          to={`/shop?category=${product.category_name}`}
          className="block truncate text-[11px] text-primary-600 font-medium uppercase tracking-wider mb-1.5"
        >
          {product.category_name}
        </Link>

        <Link
          to={`/shop/${product.slug}`}
          className="min-h-10 mb-1.5"
        >
          <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(product.average_rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-500 ml-1">
            ({product.review_count})
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
            {product.discount_price ? (
              <>
                <span className="text-lg font-bold text-gray-900 leading-tight">
                  {formatCurrency(product.effective_price)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900 leading-tight">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="mt-3 w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={15} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
