import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { openWhatsApp } from "@/lib/whatsapp";
import { trackProductView } from "@/lib/analytics";
import { ImagePreview } from "./ImagePreview";
import type { Product } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mediaRef = useRef<HTMLDivElement>(null);

  const isVideo = (url: string): boolean => {
    if (!url) return false;
    return url.includes('data:video') || url.toLowerCase().endsWith('.mp4');
  };

  // Fix for mobile touch issues - prevents images from turning white
  useEffect(() => {
    // Get the image element in this component
    const productImage = mediaRef.current?.querySelector('img');
    if (!productImage) return;
    
    // Prevent default touch behaviors that cause the white image issue
    const disableTouchEffects = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    // Add event listeners to prevent problematic browser behaviors
    productImage.addEventListener('contextmenu', disableTouchEffects);
    productImage.addEventListener('touchstart', disableTouchEffects, { passive: false });
    productImage.addEventListener('touchmove', disableTouchEffects, { passive: false });
    
    // Apply CSS properties as inline styles
    productImage.setAttribute('style', 
      'touch-action: none; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none;'
    );
    
    // Clean up event listeners when component unmounts
    return () => {
      productImage.removeEventListener('contextmenu', disableTouchEffects);
      productImage.removeEventListener('touchstart', disableTouchEffects);
      productImage.removeEventListener('touchmove', disableTouchEffects);
    };
  }, [currentMediaIndex]);

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

  // Track product view when component mounts
  useEffect(() => {
    // Send product view analytics event
    trackProductView({
      id: product.id,
      name: product.name,
      category: product.category
    });
  }, [product.id]); // Only re-run if product ID changes

  // JSON-LD schema for the product
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "category": product.category,
    "image": product.media.length > 0 ? product.media[0].full : "",
    "offers": {
      "@type": "Offer",
      "availability": product.soldOut 
        ? "https://schema.org/OutOfStock" 
        : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "brand": {
      "@type": "Brand",
      "name": "Viba Chic"
    }
  };

  return (
    <article className="overflow-hidden group">
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      
      <Card>
        <CardContent className="p-0">
          {/* Media Section */}
          <figure className="relative bg-muted">
            <div 
              ref={mediaRef}
              className="relative aspect-square"
            >
            {product.media.length > 0 ? (
              <>
                {isVideo(currentMediaItem.full) ? (
                  <video
                    src={currentMediaItem.full}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedData={() => setIsLoading(false)}
                  />
                ) : (
                  <div 
                    className="relative w-full h-full cursor-zoom-in"
                    onClick={() => setShowPreview(true)}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 bg-muted animate-pulse" />
                    )}
                    <img
                      src={currentMediaItem.full} 
                      alt={`${product.name} preview`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        isLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                      onLoad={() => setIsLoading(false)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}

                {/* Navigation Arrows */}
                {product.media.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previousMedia();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextMedia();
                      }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentMediaIndex(index);
                            setIsLoading(true);
                          }}
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

                {/* New Collection Badge */}
                {product.isNewCollection && (
                  <Badge className="absolute top-2 right-2 z-10">
                    New Collection
                  </Badge>
                )}

                {/* Sold Out Overlay */}
                {product.soldOut && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <div className="bg-black/70 text-white px-6 py-3 font-bold text-lg uppercase transform -rotate-12 pointer-events-none">
                      Sold Out
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image available
              </div>
            )}
            </div>
          </figure>

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
            disabled={product.soldOut}
          >
            {product.soldOut ? "Sold Out" : "Inquire on WhatsApp"}
          </Button>
        </CardFooter>

        {/* Image Preview Dialog */}
        {!isVideo(currentMediaItem?.full) && (
          <ImagePreview
            images={product.media}
            productName={product.name}
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            initialIndex={currentMediaIndex}
          />
        )}
      </Card>
    </article>
  );
}