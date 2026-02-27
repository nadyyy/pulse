import Link from "next/link";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
};

function withPage(
  searchParams: Record<string, string | undefined>,
  page: number,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value || key === "page") {
      continue;
    }
    query.set(key, value);
  }
  query.set("page", String(page));
  return `?${query.toString()}`;
}

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="pagination">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="row">
        {page > 1 ? (
          <Link
            className="button ghost"
            href={`${basePath}${withPage(searchParams, page - 1)}`}
          >
            Prev
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            className="button ghost"
            href={`${basePath}${withPage(searchParams, page + 1)}`}
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
