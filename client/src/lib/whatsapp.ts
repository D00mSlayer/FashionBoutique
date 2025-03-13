import type { Product } from "@shared/schema";

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
  const phoneNumber = "+919876543210"; // Replace with actual number
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}
