import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  sizes,
  colors,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategory}
              className="w-[200px] justify-between"
            >
              {selectedCategory || "All Categories"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
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
              className="w-[200px] justify-between"
            >
              {selectedSizes.length
                ? `${selectedSizes.length} sizes selected`
                : "Select Sizes"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <ScrollArea className="h-[200px]">
              <div className="space-y-1 p-1">
                {sizes.map((size) => (
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
              className="w-[200px] justify-between"
            >
              {selectedColors.length
                ? `${selectedColors.length} colors selected`
                : "Select Colors"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <ScrollArea className="h-[200px]">
              <div className="space-y-1 p-1">
                {colors.map((color) => (
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