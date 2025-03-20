import * as React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@shared/schema";

interface ImagePreviewProps {
  images: MediaItem[];
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function ImagePreview({ 
  images, 
  productName,
  isOpen,
  onClose,
  initialIndex = 0
}: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isLoading, setIsLoading] = React.useState(true);

  // Reset current index when initial index changes
  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
  };

  const showPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
  };

  if (!images.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={images[currentIndex].full}
            alt={`${productName} full view`}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
          />
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={showPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={showNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-background/80 rounded-full px-2 py-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsLoading(true);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex
                        ? "bg-foreground"
                        : "bg-foreground/50"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}