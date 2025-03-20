import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { openWhatsApp } from "@/lib/whatsapp";
import type { Product } from "@shared/schema";
import { useState, useRef, TouchEvent, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mediaRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Lazy load full-size media
  const { data: additionalMedia } = useQuery({
    queryKey: [`/api/products/${product.id}/media`],
    enabled: mediaRef.current !== null, // Only fetch when component is mounted
    staleTime: Infinity, // Cache the result indefinitely
  });

  const allMedia = product.media;
  const isVideo = (url: string) => url.startsWith('data:video');

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
      prev === allMedia.length - 1 ? 0 : prev + 1
    );
    setIsLoading(true);
  };

  const previousMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? allMedia.length - 1 : prev - 1
    );
    setIsLoading(true);
  };

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
            {allMedia.length > 0 ? (
              <>
                {isVideo(allMedia[currentMediaIndex].thumbnail) ? (
                  <video
                    key={currentMediaIndex}
                    src={allMedia[currentMediaIndex].thumbnail}
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
                  <img
                    key={currentMediaIndex}
                    src={allMedia[currentMediaIndex].thumbnail}
                    alt={`${product.name} - Image ${currentMediaIndex + 1}`}
                    className={`object-cover w-full h-full transition-opacity duration-300 ${
                      isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={() => setIsLoading(false)}
                    loading={currentMediaIndex === 0 ? "eager" : "lazy"}
                  />
                )}

                {/* Loading Skeleton */}
                {isLoading && (
                  <div className="absolute inset-0 bg-muted animate-pulse" />
                )}

                {/* Navigation Arrows - Only visible on hover */}
                {allMedia.length > 1 && (
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

                    {/* Dots Indicator - Always visible */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/30 rounded-full px-2 py-1">
                      {allMedia.map((_, index) => (
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

        {/* Product Details - Show Immediately */}
        <div className="p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {product.description}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="font-medium">Sizes:</span>{" "}
              {product.sizes.join(", ")}
            </p>
            <p className="text-sm">
              <span className="font-medium">Colors:</span>{" "}
              {product.colors.join(", ")}
            </p>
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