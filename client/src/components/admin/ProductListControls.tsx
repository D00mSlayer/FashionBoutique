import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@shared/schema";

type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc";

interface ProductListControlsProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  category: string | "all";
  onCategoryChange: (value: string | "all") => void;
  showNewCollectionOnly: boolean;
  onNewCollectionChange: (value: boolean) => void;
}

export function ProductListControls({
  sortBy,
  onSortChange,
  category,
  onCategoryChange,
  showNewCollectionOnly,
  onNewCollectionChange
}: ProductListControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="w-48">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <Select
          value={showNewCollectionOnly ? "new" : "all"}
          onValueChange={(value) => onNewCollectionChange(value === "new")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Collection..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="new">New Collection Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
