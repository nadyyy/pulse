import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="shell section-gap stack">
      <Skeleton className="loading-hero" />
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={`sk-${index}`} className="loading-card" />
        ))}
      </div>
    </main>
  );
}
