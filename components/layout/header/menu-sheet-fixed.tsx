"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Loader2,
  Home,
  ShoppingCart,
  Heart,
  ArrowRight,
  Layers,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useStoreConfig } from "@/hooks/use-store-config";
import { getAllCollections, getPages } from "@/lib/api/shopify/actions";
import type { ShopifyCollection, ShopifyPage } from "@/lib/types";
import { transformShopifyUrl } from "@/components/utils/transform-shopify-url";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  title: string;
  url: string;
  items?: MenuItem[];
}

interface MenuSheetProps {
  items: MenuItem[];
}

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-3">
    <div className="flex flex-col gap-0.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
        {title}
      </h3>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
    <div className="space-y-2">{children}</div>
  </section>
);

const getCollectionProductCount = (collection: ShopifyCollection) =>
  collection.products?.productsCount ?? collection.products?.nodes?.length ?? 0;

const buildPageUrl = (page: ShopifyPage) => {
  if (page.handle) {
    return `/pages/${page.handle}`;
  }
  return transformShopifyUrl(page.onlineStoreUrl || "/");
};

export function MenuSheetFixed({ items }: MenuSheetProps) {
  const router = useRouter();
  const { storeName, storeDescription, branding } = useStoreConfig();
  const { openCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [pages, setPages] = useState<ShopifyPage[]>([]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (collections.length && pages.length) return;

    setIsLoading(true);
    Promise.all([getAllCollections(), getPages()])
      .then(([collectionData, pageData]) => {
        setCollections(collectionData ?? []);
        setPages(pageData ?? []);
      })
      .catch((error) => {
        console.error("Error loading navigation data:", error);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, collections.length, pages.length]);

  const handleNavigate = useCallback(
    (url: string) => {
      setIsOpen(false);
      requestAnimationFrame(() => router.push(url));
    },
    [router]
  );

  const handleCartClick = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => openCart());
  }, [openCart]);

  const featuredCollections = useMemo(() => collections.slice(0, 6), [collections]);
  const featuredPages = useMemo(() => pages.slice(0, 6), [pages]);

  const renderMenuItems = (menuItems: MenuItem[], depth = 0) => (
    <div
      className={cn(
        depth === 0 ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "flex flex-col gap-2 border-l border-border/50 pl-4"
      )}
    >
      {menuItems.map((item) => {
        const hasChildren = Boolean(item.items && item.items.length > 0);
        const itemInitial = item.title.charAt(0).toUpperCase();

        return (
          <div key={`${item.id}-${depth}`} className={cn("space-y-2", depth > 0 && "space-y-1")}>
            <button
              type="button"
              onClick={() => handleNavigate(item.url)}
              className={cn(
                "group flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background/95 px-4 py-3 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5",
                depth > 0 &&
                  "rounded-xl border-none bg-transparent px-3 py-2 hover:-translate-y-0 hover:bg-muted/60 hover:shadow-none"
              )}
            >
              <div className="flex items-center gap-3">
                {depth === 0 ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold uppercase text-primary">
                    {itemInitial}
                  </span>
                ) : null}
                <div className="flex flex-col text-left">
                  <span className="font-medium text-foreground">{item.title}</span>
                  {hasChildren && depth === 0 ? (
                    <span className="text-xs text-muted-foreground">{item.items?.length} categories inside</span>
                  ) : null}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-primary/60 transition group-hover:translate-x-1" />
            </button>
            {hasChildren ? renderMenuItems(item.items ?? [], depth + 1) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 mr-6 inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
          <span>Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex h-full w-full flex-col border-0 bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="relative p-0 text-left">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 pb-6 pt-7">
            <div className="pointer-events-none absolute -right-16 top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl sm:block" />
            <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/60 bg-white/80 shadow-sm">
                {branding?.logoUrl ? (
                  <Image
                    src={branding.logoUrl}
                    alt={`${storeName} logo`}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
                    {storeName?.charAt(0).toUpperCase() ?? "S"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <SheetTitle className="text-lg font-semibold text-foreground">{storeName}</SheetTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {storeDescription || "Discover the best from our catalog."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {items.length} menu sections
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1">
                    <Layers className="h-3 w-3 text-primary/80" />
                    {collections.length ? `${collections.length} collections` : "Loading collections"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1">
                    <BookOpen className="h-3 w-3 text-primary/80" />
                    {pages.length ? `${pages.length} pages` : "Loading pages"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6">
          {isLoading && !collections.length && !pages.length ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              <Section title="Main Menu" description="Quick access to every corner of the shop">
                {items.length ? (
                  renderMenuItems(items)
                ) : (
                  <p className="text-sm text-muted-foreground">No menu items configured.</p>
                )}
              </Section>

              <Section title="Featured Collections" description="Handpicked sets to explore">
                {featuredCollections.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {featuredCollections.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => handleNavigate(`/collections/${collection.handle}`)}
                        className="group overflow-hidden rounded-2xl border border-border/60 bg-background/95 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          {collection.image?.url ? (
                            <Image
                              src={collection.image.url}
                              alt={collection.title}
                              fill
                              sizes="(max-width: 640px) 100vw, 50vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              <Layers className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{collection.title}</p>
                            <p className="text-xs text-muted-foreground">Explore {getCollectionProductCount(collection)} products</p>
                          </div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:translate-x-1">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Collections will appear here once available.</p>
                )}
              </Section>

              <Section title="Helpful Pages" description="Guides, policies, and resources">
                {featuredPages.length ? (
                  <div className="space-y-3">
                    {featuredPages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => handleNavigate(buildPageUrl(page))}
                        className="group flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background/95 px-4 py-3 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5"
                      >
                        <div className="flex items-start gap-3 text-left">
                          <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <BookOpen className="h-4 w-4" />
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">{page.title}</span>
                            {page.bodySummary ? (
                              <span
                                className="text-xs text-muted-foreground"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical" as const,
                                  overflow: "hidden",
                                }}
                              >
                                {page.bodySummary}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary/60 transition group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Pages will appear here once published.</p>
                )}
              </Section>
            </div>
          )}
        </div>

        <div className="border-t border-border/80 bg-muted/30 px-4 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("/")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/95 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5"
            >
              <Home className="h-4 w-4 text-primary" />
              <span>Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("/wishlist")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/95 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5"
            >
              <Heart className="h-4 w-4 text-primary" />
              <span>Wishlist</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCartClick}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/95 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5"
            >
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span>Cart</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
