import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "~/store/userStore";
import { CosmicBackground } from "~/components/CosmicBackground";
import { GlowingButton } from "~/components/GlowingButton";
import { MysticalCard } from "~/components/MysticalCard";
import { ShoppingCart, Star, Package, Sparkles } from "lucide-react";

export const Route = createFileRoute("/marketplace/")({
  component: MarketplacePage,
});

function MarketplacePage() {
  const { userId } = useUserStore();
  const trpc = useTRPC();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [cart, setCart] = useState<Array<{ productId: number; quantity: number }>>([]);

  const productsQuery = useQuery(
    trpc.getProducts.queryOptions({
      type: selectedType as any,
      limit: 20,
    })
  );

  const subscriptionQuery = useQuery(
    trpc.getUserSubscription.queryOptions({ userId: userId! })
  );

  const products = productsQuery.data?.products || [];
  const subscription = subscriptionQuery.data?.subscription;

  const productTypes = [
    { value: undefined, label: "All Products", icon: Package },
    { value: "RITUAL_KIT", label: "Ritual Kits", icon: Sparkles },
    { value: "GUIDED_SESSION", label: "Guided Sessions", icon: Star },
    { value: "DIGITAL_CONTENT", label: "Digital Content", icon: Package },
  ];

  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 text-white">
      <CosmicBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
            Dream Ritual Marketplace
          </h1>
          <p className="text-xl text-purple-200">
            Enhance your dream practice with expert guidance and sacred tools
          </p>

          {subscription && (
            <div className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-400/30">
              <span className="text-purple-200">
                ✨ {subscription.plan.name} Member
              </span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {productTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value || "all"}
                onClick={() => setSelectedType(type.value)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                  selectedType === type.value
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-purple-900/30 text-purple-200 hover:bg-purple-800/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.map((product) => (
            <MysticalCard key={product.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-100">
                    {product.name}
                  </h3>
                  {product.averageRating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">
                        {Number(product.averageRating).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-purple-200 text-sm mb-4 line-clamp-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-300">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <GlowingButton onClick={() => addToCart(product.id)}>
                    Add to Cart
                  </GlowingButton>
                </div>

                {product.reviewCount > 0 && (
                  <p className="text-xs text-purple-300 mt-2">
                    {product.reviewCount} reviews
                  </p>
                )}
              </div>
            </MysticalCard>
          ))}
        </div>

        {products.length === 0 && !productsQuery.isLoading && (
          <div className="text-center py-12">
            <p className="text-purple-300 text-lg">
              No products found in this category
            </p>
          </div>
        )}

        {/* Shopping Cart */}
        {cart.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50">
            <MysticalCard>
              <div className="p-6 min-w-[300px]">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-purple-300" />
                  <h3 className="text-lg font-bold text-purple-100">
                    Cart ({cart.length})
                  </h3>
                </div>

                <div className="space-y-2 mb-4">
                  {cart.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    return product ? (
                      <div
                        key={item.productId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-purple-200">
                          {product.name} x{item.quantity}
                        </span>
                        <span className="text-purple-300 font-semibold">
                          ${(Number(product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>

                <div className="border-t border-purple-700 pt-4 mb-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-purple-100">Total</span>
                    <span className="text-purple-300">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <GlowingButton
                  onClick={() => {
                    // TODO: Implement checkout
                    alert("Checkout coming soon!");
                  }}
                  className="w-full"
                >
                  Checkout
                </GlowingButton>
              </div>
            </MysticalCard>
          </div>
        )}
      </div>
    </div>
  );
}
