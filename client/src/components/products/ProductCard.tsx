import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { openWhatsApp } from "@/lib/whatsapp";
import type { Product } from "@shared/schema";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const isVideo = (url: string) => url.startsWith('data:video');

  const handleImageError = () => {
    console.error("Failed to load image for product:", product.name);
    setImageError(true);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted">
          {product.images[0] ? (
            isVideo(product.images[0]) ? (
              <video
                src={product.images[0]}
                className="object-cover w-full h-full"
                controls
                muted
                playsInline
                onError={() => handleImageError()}
              />
            ) : (
              <img
                src={product.images[0]}
                alt={product.name}
                className="object-cover w-full h-full"
                onError={() => handleImageError()}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image available
            </div>
          )}
          {product.isNewCollection && (
            <Badge className="absolute top-2 right-2">
              New Collection
            </Badge>
          )}
        </div>
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