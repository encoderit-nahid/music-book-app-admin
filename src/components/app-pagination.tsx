import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {usePagination} from "@/hooks/use-pagination";

type PaginationProps = {
  meta?: {
    first_page_url: null | string,
    prev_page_url: null | string,
    next_page_url: null | string,
    last_page_url: null | string,
    path: string,
    current_page: number,
    last_page: number,
    from: number,
    to: number,
    per_page: number,
    total: number,
  }
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number;
  onClickPage: (page: number) => void;
  onClickPrev: (page: number) => void;
  onClickNext: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
};

export default function AppPagination({
                                        meta,
                                        currentPage,
                                        totalPages,
                                        paginationItemsToDisplay = 5,
                                        onClickPage,
                                        onClickPrev,
                                        onClickNext,
                                        onPerPageChange,
                                      }: PaginationProps) {
  const {pages, showLeftEllipsis, showRightEllipsis} = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay: paginationItemsToDisplay || 5,
  });

  if (!meta) {
    return null;
  }

  const metaData = meta as NonNullable<typeof meta>;

  return (
      <div className="w-full flex items-center justify-between text-custom-footer-text">
        {/* Mobile version */}
        <div className="flex w-full items-center justify-between md:hidden">
          <p className="text-sm font-medium">
            Page {metaData.current_page} of {metaData.last_page}
          </p>

          <div className="flex items-center gap-2">
            <button
                disabled={!metaData.prev_page_url}
                onClick={() => metaData.prev_page_url && onClickPrev(metaData.current_page - 1)}
                className="p-2 rounded-lg border border-custom-footer-text disabled:opacity-40"
            >
              <ChevronLeftIcon size={16}/>
            </button>

            <button
                disabled={!metaData.next_page_url}
                onClick={() => metaData.next_page_url && onClickNext(metaData.current_page + 1)}
                className="p-2 rounded-lg border border-custom-footer-text disabled:opacity-40"
            >
              <ChevronRightIcon size={16}/>
            </button>
          </div>
        </div>

        {/* Desktop version */}
        <div className="hidden md:flex items-center justify-between w-full gap-3">
          {/* Page number info */}
          <p className="flex-1 whitespace-nowrap text-sm font-medium">
            Showing <span>{metaData.from}</span> to{" "}
            <span>{metaData.to} of {metaData.total} entries</span>
          </p>

          {/* Full pagination */}
          <div className="grow">
            <Pagination>
              <PaginationContent>
                {/* Prev */}
                <PaginationItem>
                  <PaginationLink
                      aria-disabled={!metaData.prev_page_url}
                      onClick={() =>
                          metaData.prev_page_url && onClickPrev(metaData.current_page - 1)
                      }
                      className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50 "
                  >
                    <div className="flex items-center gap-2 mr-8 text-custom-footer-text font-medium">
                      <ChevronLeftIcon size={16}/>
                      <h1 className="text-sm font-medium">Prev</h1>
                    </div>
                  </PaginationLink>
                </PaginationItem>

                {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis/>
                    </PaginationItem>
                )}

                {pages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                          isActive={page === metaData.current_page}
                          onClick={() => onClickPage(page)}
                          className={`cursor-pointer ${
                              page === metaData.current_page
                                  ? "bg-custom-main-btn  text-custom-background-white "
                                  : "text-custom-footer-text bg-custom-footer-number-background"
                          }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                ))}

                {showRightEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis/>
                    </PaginationItem>
                )}

                {/* Next */}
                <PaginationItem>
                  <PaginationLink
                      aria-disabled={!metaData.next_page_url}
                      onClick={() =>
                          metaData.next_page_url && onClickNext(metaData.current_page + 1)
                      }
                      className="cursor-pointer aria-disabled:pointer-events-none aria-disabled:opacity-50 "
                  >
                    <div className="flex items-center gap-2 ml-8 text-custom-footer-text font-medium">
                      <h1 className="text-sm font-medium">Next</h1>
                      <ChevronRightIcon size={16}/>
                    </div>
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {/* Results per page */}
          <div className="flex flex-1 justify-end text-custom-footer-text">
            <div className="flex items-center gap-2">
              <Select
                defaultValue={metaData?.per_page?.toString()}
                onValueChange={(value) => onPerPageChange?.(parseInt(value))}
              >
                <SelectTrigger className="w-fit whitespace-nowrap">
                  <SelectValue placeholder="Select number of results"/>
                </SelectTrigger>
                <SelectContent className="text-custom-footer-text">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <h1 className="text-sm font-medium">Items per page</h1>
            </div>
          </div>
        </div>
      </div>
  );
}
