import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Default values from schema
const availableSizes = [
  "Free Size",
  "XS", "S", "M", "L", "XL", "XXL",
  "26", "28", "30", "32", "34", "36", "38", "40"
] as const;

const availableColors = [
  "Black", "White", "Grey", "Navy Blue",
  "Red", "Maroon", "Pink", "Light Pink", "Peach",
  "Orange", "Rust", "Brown", "Beige", "Cream",
  "Blue", "Light Blue", "Sky Blue", "Turquoise",
  "Green", "Olive", "Mint", "Sage",
  "Purple", "Lavender", "Wine",
  "Yellow", "Mustard", "Gold",
  "Floral", "Striped", "Checked", "Polka Dots"
] as const;

interface ProductFiltersProps {
  categories: string[];
  sizes: string[];
  colors: string[];
  selectedCategory: string | null;
  selectedSizes: string[];
  selectedColors: string[];
  showNewOnly: boolean;
  onSelectCategory: (category: string | null) => void;
  onSelectSize: (size: string) => void;
  onSelectColor: (color: string) => void;
  onToggleNewOnly: (show: boolean) => void;
}

export function ProductFilters({
  categories,
  selectedCategory,
  selectedSizes,
  selectedColors,
  showNewOnly,
  onSelectCategory,
  onSelectSize,
  onSelectColor,
  onToggleNewOnly,
}: ProductFiltersProps) {
  const [openCategory, setOpenCategory] = useState(false);
  const [openSizes, setOpenSizes] = useState(false);
  const [openColors, setOpenColors] = useState(false);

  const hasActiveFilters = selectedCategory || selectedSizes.length > 0 || selectedColors.length > 0 || showNewOnly;

  const handleReset = () => {
    onSelectCategory(null);
    selectedSizes.forEach(size => onSelectSize(size));
    selectedColors.forEach(color => onSelectColor(color));
    if (showNewOnly) onToggleNewOnly(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Category Filter */}
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategory}
              className="w-full sm:w-[200px] justify-between text-left"
            >
              {selectedCategory || "All Categories"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-[200px] p-0">
            <ScrollArea className="h-[200px]">
              <div className="space-y-1 p-1">
                <Button
                  variant={!selectedCategory ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    onSelectCategory(null);
                    setOpenCategory(false);
                  }}
                >
                  All Categories
                  {!selectedCategory && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    onClick={() => {
                      onSelectCategory(category);
                      setOpenCategory(false);
                    }}
                  >
                    {category}
                    {selectedCategory === category && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Sizes Filter */}
        <Popover open={openSizes} onOpenChange={setOpenSizes}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openSizes}
              className={cn(
                "w-full sm:w-[200px] justify-between text-left",
                selectedSizes.length > 0 && "border-primary"
              )}
            >
              {selectedSizes.length
                ? `${selectedSizes.length} sizes selected`
                : "Select Sizes"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-[200px] p-0">
            <ScrollArea className="h-[200px]">
              <div className="space-y-1 p-1">
                {availableSizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSizes.includes(size) ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    onClick={() => onSelectSize(size)}
                  >
                    {size}
                    {selectedSizes.includes(size) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Colors Filter */}
        <Popover open={openColors} onOpenChange={setOpenColors}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openColors}
              className={cn(
                "w-full sm:w-[200px] justify-between text-left",
                selectedColors.length > 0 && "border-primary"
              )}
            >
              {selectedColors.length
                ? `${selectedColors.length} colors selected`
                : "Select Colors"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-[200px] p-0">
            <ScrollArea className="h-[200px]">
              <div className="space-y-1 p-1">
                {availableColors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColors.includes(color) ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    onClick={() => onSelectColor(color)}
                  >
                    {color}
                    {selectedColors.includes(color) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="animate-in fade-in"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New Collection Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="new-collection"
          checked={showNewOnly}
          onCheckedChange={onToggleNewOnly}
        />
        <Label htmlFor="new-collection">Show New Collection Only</Label>
      </div>
    </div>
  );
}