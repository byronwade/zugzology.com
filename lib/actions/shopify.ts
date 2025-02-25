// Re-export all Shopify server actions from the main implementation
export * from "@/lib/api/shopify/actions";

// Add a more efficient version of getProductPageData that uses getProductsByIds
import { getProductPageData as originalGetProductPageData, getProduct } from "@/lib/api/shopify/actions";
import { getProductsByIds } from "@/lib/api/shopify/actions";
import { debugLog } from "@/lib/utils";
import { ShopifyProduct } from "@/lib/types";

/**
 * Optimized version of getProductPageData that avoids loading all products
 * This function fetches only the specific product and its related data
 */
export async function getProductPageData(handle: string) {
  debugLog("ShopifyAPI", "Fetching single product data", { handle });
  
  // First, get the main product data using direct product fetch
  const product = await getProduct(handle);
  
  // If no product was found, return early
  if (!product) {
    debugLog("ShopifyAPI", "Product not found", { handle });
    return {
      product: null,
      relatedProducts: [],
      recentPosts: [],
    };
  }
  
  // Instead of loading all products for recommendations, we'll use a more targeted approach
  try {
    // Check for complementary products in metafields
    const complementaryMetafield = product.metafields?.find(
      (metafield) => metafield && 
      metafield.namespace === "shopify--discovery--product_recommendation" && 
      metafield.key === "complementary_products"
    );
    
    let relatedProducts: ShopifyProduct[] = [];
    
    if (complementaryMetafield?.value) {
      // Parse the complementary product data
      const complementaryData = JSON.parse(complementaryMetafield.value);
      debugLog("ShopifyAPI", "Found complementary products metafield", complementaryData);
      
      // Get the product references from the correct structure
      const productReferences = (complementaryData?.recommendations || []).filter(Boolean);
      
      if (productReferences.length > 0) {
        // Extract product IDs
        const productIds = productReferences
          .map((ref: any) => {
            if (!ref) return null;
            // Extract the product ID from the reference
            return typeof ref === "string" ? ref : ref.id;
          })
          .filter(Boolean);
        
        // Fetch only the specific products we need
        if (productIds.length > 0) {
          relatedProducts = await getProductsByIds(productIds);
          debugLog("ShopifyAPI", "Fetched complementary products", { count: relatedProducts.length });
        }
      }
    }
    
    // Return the product and related data
    return {
      product,
      relatedProducts,
      recentPosts: [], // We'll fetch these separately in the server component
    };
  } catch (error) {
    console.error("Error enhancing product page data:", error);
    // Fall back to just the product
    return {
      product,
      relatedProducts: [] as ShopifyProduct[],
      recentPosts: [],
    };
  }
}
