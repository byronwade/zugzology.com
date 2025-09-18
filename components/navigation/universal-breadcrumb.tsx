"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface UniversalBreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

/**
 * Universal breadcrumb component that automatically generates breadcrumbs
 * based on the current pathname or accepts custom breadcrumb items
 */
export function UniversalBreadcrumb({ 
  items,
  className = "",
  showHome = true 
}: UniversalBreadcrumbProps) {
  const pathname = usePathname();

  // If custom items are provided, use them
  if (items) {
    return (
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {items.map((item, index) => (
            <div key={item.url} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.current || index === items.length - 1 ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.url}>{item.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Auto-generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = generateBreadcrumbsFromPath(pathSegments);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {showHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.length > 0 && <BreadcrumbSeparator />}
          </>
        )}
        
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.url} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.url}>{crumb.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Generate breadcrumbs from path segments
 */
function generateBreadcrumbsFromPath(segments: string[]): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Transform segment to readable name
    const name = transformSegmentToName(segment, segments, index);
    
    breadcrumbs.push({
      name,
      url: currentPath,
      current: index === segments.length - 1
    });
  });

  return breadcrumbs;
}

/**
 * Transform URL segment to human-readable name
 */
function transformSegmentToName(segment: string, allSegments: string[], index: number): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'products': 'Products',
    'collections': 'Collections',
    'blogs': 'Blog',
    'account': 'Account',
    'cart': 'Shopping Cart',
    'wishlist': 'Wishlist',
    'search': 'Search Results',
    'help': 'Help & Support',
    'login': 'Sign In',
    'register': 'Create Account',
    'error': 'Error',
    'not-found': 'Page Not Found',
    'loading': 'Loading',
  };

  // Check if it's a special case
  if (specialCases[segment]) {
    return specialCases[segment];
  }

  // Handle account sub-pages
  if (allSegments[index - 1] === 'account') {
    if (segment.match(/^\d+$/)) {
      return `Order #${segment}`;
    }
    return capitalizeWords(segment.replace(/-/g, ' '));
  }

  // Handle blog categories and posts
  if (allSegments[index - 1] === 'blogs' && allSegments[index + 1]) {
    return capitalizeWords(segment.replace(/-/g, ' '));
  }

  // Handle dynamic segments (product handles, collection handles, etc.)
  if (segment.includes('-') || segment.includes('_')) {
    return capitalizeWords(segment.replace(/[-_]/g, ' '));
  }

  // Default transformation
  return capitalizeWords(segment);
}

/**
 * Capitalize words in a string
 */
function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Pre-built breadcrumb configurations for common page types
 */
export const BreadcrumbConfigs = {
  home: (): BreadcrumbItem[] => [
    { name: "Home", url: "/", current: true }
  ],
  
  products: (): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products", current: true }
  ],
  
  product: (productHandle: string, productTitle: string): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: productTitle, url: `/products/${productHandle}`, current: true }
  ],
  
  collection: (collectionHandle: string, collectionTitle: string): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Collections", url: "/collections" },
    { name: collectionTitle, url: `/collections/${collectionHandle}`, current: true }
  ],
  
  blog: (): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blogs", current: true }
  ],
  
  blogCategory: (categoryHandle: string, categoryTitle: string): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blogs" },
    { name: categoryTitle, url: `/blogs/${categoryHandle}`, current: true }
  ],
  
  blogPost: (categoryHandle: string, categoryTitle: string, postHandle: string, postTitle: string): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blogs" },
    { name: categoryTitle, url: `/blogs/${categoryHandle}` },
    { name: postTitle, url: `/blogs/${categoryHandle}/${postHandle}`, current: true }
  ],
  
  cart: (): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Shopping Cart", url: "/cart", current: true }
  ],
  
  wishlist: (): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Wishlist", url: "/wishlist", current: true }
  ],
  
  search: (): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Search Results", url: "/search", current: true }
  ],
  
  account: (): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Account", url: "/account", current: true }
  ],
  
  accountOrder: (orderNumber: string): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Account", url: "/account" },
    { name: `Order #${orderNumber}`, url: `/account/${orderNumber}`, current: true }
  ],
  
  help: (): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: "Help & Support", url: "/help", current: true }
  ],
  
  auth: (type: 'login' | 'register'): BreadcrumbItem[] => [
    { name: "Home", url: "/" },
    { name: type === 'login' ? "Sign In" : "Create Account", url: `/${type}`, current: true }
  ],
};