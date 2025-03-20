import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@shared/schema";

interface ImagePreviewProps {
  images: MediaItem[];
  productName: string;
}

export function ImagePreview({ images, productName }: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const showPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];

  if (!images.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-zoom-in">
          <img
            src={currentImage.thumbnail}
            alt={`${productName} preview`}
            className="w-full h-full object-cover rounded-lg transition-opacity group-hover:opacity-95"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <div className="relative w-full h-full">
          <img
            src={currentImage.full}
            alt={`${productName} full view`}
            className="w-full h-full object-contain"
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
