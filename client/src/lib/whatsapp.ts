import type { Product } from "@shared/schema";
import { trackWhatsAppInquiry } from "./analytics";

export function createWhatsAppMessage(product: Product): string {
  const message = `Hi, I'm interested in:\n\n` +
    `Product: ${product.name}\n` +
    `Category: ${product.category}\n` +
    `Available Sizes: ${product.sizes.join(", ")}\n` +
    `Colors: ${product.colors.join(", ")}\n\n` +
    `Could you please provide more details?`;
    
  return encodeURIComponent(message);
}

export function openWhatsApp(product: Product) {
  const message = createWhatsAppMessage(product);
  const phoneNumber = "+916363840247"; // Replace with actual number
  
  // Track WhatsApp inquiry event for analytics
  trackWhatsAppInquiry({
    id: product.id,
    name: product.name,
    category: product.category
  });
  
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}
