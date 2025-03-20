import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { openWhatsApp } from "@/lib/whatsapp";
import { ImagePreview } from "./ImagePreview";
import type { Product } from "@shared/schema";
import { useState, useRef, TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mediaRef = useRef<HTMLDivElement>(null);

  const isVideo = (url: string): boolean => {
    if (!url) return false;
    return url.includes('data:video') || url.toLowerCase().endsWith('.mp4');
  };

  // Minimum swipe distance for navigation (in pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextMedia();
    }
    if (isRightSwipe) {
      previousMedia();
    }
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === product.media.length - 1 ? 0 : prev + 1
    );
    setIsLoading(true);
  };

  const previousMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? product.media.length - 1 : prev - 1
    );
    setIsLoading(true);
  };

  const currentMediaItem = product.media[currentMediaIndex];

  return (
    <Card className="overflow-hidden group">
      <CardContent className="p-0">
        {/* Media Section with Skeleton */}
        <div className="relative aspect-square bg-muted">
          <div 
            ref={mediaRef}
            className="relative w-full h-full"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {product.media.length > 0 ? (
              <>
                {isVideo(currentMediaItem.thumbnail) ? (
                  <video
                    key={currentMediaIndex}
                    src={currentMediaItem.thumbnail}
                    className={`object-cover w-full h-full transition-opacity duration-300 ${
                      isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    controls
                    muted
                    playsInline
                    onLoadedData={() => setIsLoading(false)}
                    preload="metadata"
                  />
                ) : (
                  <ImagePreview
                    images={product.media}
                    productName={product.name}
                  />
                )}

                {/* Loading Skeleton */}
                {isLoading && (
                  <div className="absolute inset-0 bg-muted animate-pulse" />
                )}

                {/* Navigation Arrows */}
                {product.media.length > 1 && (
                  <>
                    <button
                      onClick={previousMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/30 rounded-full px-2 py-1">
                      {product.media.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentMediaIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {/* New Collection Badge */}
          {product.isNewCollection && (
            <Badge className="absolute top-2 right-2 z-10">
              New Collection
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {product.description}
          </p>
          <div className="mt-2 space-y-1">
            {product.sizes.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">Sizes:</span>{" "}
                {product.sizes.join(", ")}
              </p>
            )}
            {product.colors.length > 0 && (
              <p className="text-sm">
                <span className="font-medium">Colors:</span>{" "}
                {product.colors.join(", ")}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => openWhatsApp(product)}
        >
          Inquire on WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
}