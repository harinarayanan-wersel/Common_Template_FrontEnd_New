import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const DataTable = ({
  data = [],
  columns = [],
  searchKey = "",
  searchPlaceholder = "Search...",
  pageSize = 10,
  onView,
  onEdit,
  onDelete,
  onRowClick,
  actionsLabel = "ACTIONS",
  showSearch = true,
  showPagination = true,
  className,
  renderCard,
  toolbarActions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedPageSize, setSelectedPageSize] = useState(pageSize);
  const [viewMode, setViewMode] = useState("table");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile and set default view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setViewMode("card");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((item) => {
      // If searchKey is provided, search only that field
      if (searchKey) {
        const searchValue = item[searchKey]?.toString().toLowerCase() || "";
        return searchValue.includes(searchQuery.toLowerCase());
      }

      // Otherwise, search across all column values
      return columns.some((column) => {
        const value = item[column.key]?.toString().toLowerCase() || "";
        return value.includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, searchKey, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * selectedPageSize;
    const endIndex = startIndex + selectedPageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, selectedPageSize]);

  const totalPages = Math.ceil(sortedData.length / selectedPageSize);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to first page when search or page size changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    setSelectedPageSize(Number(value));
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * selectedPageSize + 1;
  const endItem = Math.min(currentPage * selectedPageSize, sortedData.length);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and View Toggle */}
      {(showSearch || !isMobile || toolbarActions) && (
        <div className="flex flex-row items-center justify-between w-full gap-4 pb-3 border-b border-border">
          {showSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--primary))]" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 rounded-lg bg-muted border border-border py-2.5 text-sm placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-[hsl(var(--primary)/0.25)]"
              />
            </div>
          )}
          <div className="flex items-center gap-[15px] ml-auto">
            {/* View Toggle - Hidden on mobile */}
            {!isMobile && (
              <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-background p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-9 rounded-lg transition flex items-center justify-center",
                    viewMode === "table"
                      ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                      : "bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  )}
                  onClick={() => setViewMode("table")}
                  title="Table View"
                >
                  <List className="h-[18px] w-[18px]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-9 rounded-lg transition flex items-center justify-center",
                    viewMode === "card"
                      ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                      : "bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  )}
                  onClick={() => setViewMode("card")}
                  title="Card View"
                >
                  <LayoutGrid className="h-[18px] w-[18px]" />
                </Button>
              </div>
            )}
            {toolbarActions && (
              <div className="flex items-center">
                {toolbarActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        // We wrap the table in a scroll container so the sticky header can latch to the top while body scrolls.
        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <div className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 border-b backdrop-blur supports-[backdrop-filter]:backdrop-blur [&_tr]:!bg-muted/60 rounded-t-lg">
              <TableRow className="hover:!bg-muted/60">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      column.sortable && "cursor-pointer",
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && sortConfig.key === column.key && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                {(onView || onEdit || onDelete) && (
                  <TableHead className="text-center">{actionsLabel}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length + (onView || onEdit || onDelete ? 1 : 0)
                    }
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      "min-h-[60px] border-b border-border/60 last:border-b-0 py-4 text-sm hover:bg-muted/40 transition focus-within:bg-muted/40",
                      onRowClick && "cursor-pointer"
                    )}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? "button" : undefined}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={(event) => {
                      if (!onRowClick) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn("py-4", column.cellClassName || column.className)}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]?.toString() || "-"}
                      </TableCell>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] bg-muted/70 hover:bg-muted px-2 py-2 rounded-md transition"
                              onClick={(event) => {
                                event.stopPropagation();
                                onView(row);
                              }}
                              aria-label={`View ${row.name || "record"}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-[hsl(var(--primary))] bg-muted/70 hover:bg-muted px-2 py-2 rounded-md transition"
                              onClick={(event) => {
                                event.stopPropagation();
                                onEdit(row);
                              }}
                              aria-label={`Edit ${row.name || "record"}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 bg-muted/70 hover:bg-muted px-2 py-2 rounded-md transition"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDelete(row);
                              }}
                              aria-label={`Delete ${row.name || "record"}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedData.length === 0 ? (
            <div className="col-span-full h-24 flex items-center justify-center text-center text-muted-foreground">
              No results found.
            </div>
          ) : (
            paginatedData.map((row, rowIndex) => {
              // Use custom card renderer if provided
              if (renderCard) {
                return (
                  <Card
                    key={rowIndex}
                    className={cn(
                      "rounded-xl border shadow-sm overflow-hidden",
                      onRowClick && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
                    )}
                    role={onRowClick ? "button" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={(event) => {
                      if (!onRowClick) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }}
                  >
                    {renderCard(row, { onView, onEdit, onDelete })}
                  </Card>
                );
              }

              // Default card rendering
              return (
                <Card
                  key={rowIndex}
                  className={cn(
                    "rounded-xl border border-border bg-background shadow-sm overflow-hidden",
                    onRowClick && "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
                  )}
                  role={onRowClick ? "button" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(event) => {
                    if (!onRowClick) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onRowClick(row);
                    }
                  }}
                >
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      {columns.map((column) => (
                        <div key={column.key} className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {column.label}
                          </div>
                          <div
                            className={cn(
                              "text-sm",
                              column.cellClassName || column.className
                            )}
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : row[column.key]?.toString() || "-"}
                          </div>
                        </div>
                      ))}
                      {(onView || onEdit || onDelete) && (
                        <div className="flex items-center justify-center gap-2 pt-3 border-t border-border">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] bg-muted/70 hover:bg-muted px-2 py-2 rounded-md transition"
                              onClick={(event) => {
                                event.stopPropagation();
                                onView(row);
                              }}
                              aria-label={`View ${row.name || "record"}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-[hsl(var(--primary))] bg-muted/70 hover:bg-muted px-2 py-2 rounded-md transition"
                              onClick={(event) => {
                                event.stopPropagation();
                                onEdit(row);
                              }}
                              aria-label={`Edit ${row.name || "record"}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 bg-muted/70 hover:bg-muted px-2 py-2 rounded-md transition"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDelete(row);
                              }}
                              aria-label={`Delete ${row.name || "record"}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {showPagination && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 border-t mt-3">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Rows per page:
            </span>
            <Select
              value={selectedPageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[80px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            {/* Previous Button - Icon Only */}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg bg-muted hover:bg-muted/60 px-3 py-2 transition",
                currentPage === 1 && "pointer-events-none opacity-50"
              )}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* Page Numbers */}
            {isMobile
              ? // On mobile, show limited page numbers (current and adjacent)
                (() => {
                  const pages = [];
                  const maxVisible = 3; // Show max 3 pages on mobile

                  if (totalPages <= maxVisible) {
                    // Show all pages if total is 3 or less
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Show current page and adjacent pages
                    if (currentPage === 1) {
                      pages.push(1, 2, 3);
                    } else if (currentPage === totalPages) {
                      pages.push(totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(currentPage - 1, currentPage, currentPage + 1);
                    }
                  }

                  return pages.map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "w-8 h-8 rounded-full font-medium transition flex items-center justify-center",
                        currentPage === page
                          ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                          : "text-muted-foreground hover:bg-muted rounded-full"
                      )}
                      onClick={() => handlePageChange(page)}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  ));
                })()
              : // Desktop: show full pagination with ellipsis
                getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "ellipsis" ? (
                      <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "w-8 h-8 rounded-full font-medium transition flex items-center justify-center",
                          currentPage === page
                            ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted rounded-full"
                        )}
                        onClick={() => handlePageChange(page)}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}

            {/* Next Button - Icon Only */}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg bg-muted hover:bg-muted/60 px-3 py-2 transition",
                currentPage === totalPages && "pointer-events-none opacity-50"
              )}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
