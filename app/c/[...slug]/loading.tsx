import { Skeleton } from "@/components/ui/Skeleton";

export default function CategoryLoading() {
  return (
    <main className="shell section-gap">
      <Skeleton className="loading-title" />
      <div className="catalog-layout nike-catalog-layout">
        <Skeleton className="loading-filters" />
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={`cat-${index}`} className="loading-card" />
          ))}
        </div>
      </div>
    </main>
  );
}
