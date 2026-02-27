import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <main className="shell section-gap stack">
      <div className="product-layout nike-product-layout">
        <Skeleton className="loading-gallery" />
        <Skeleton className="loading-buybox" />
      </div>
    </main>
  );
}
