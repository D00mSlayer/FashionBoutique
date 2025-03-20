import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onSelectTag: (tag: string) => void;
}

export function TagFilter({ tags, selectedTags, onSelectTag }: TagFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border mt-4">
      <div className="flex space-x-2 p-4">
        {tags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            onClick={() => onSelectTag(tag)}
            className="shrink-0"
          >
            {tag}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="h-2.5" />
    </ScrollArea>
  );
}
