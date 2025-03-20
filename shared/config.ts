interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsapp: string;
}

interface ContactInfo {
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
}

interface Config {
  social: SocialLinks;
  contact: ContactInfo;
}

export const config: Config = {
  social: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL || "",
    facebook: import.meta.env.VITE_FACEBOOK_URL || "",
    whatsapp: import.meta.env.VITE_WHATSAPP_URL || "",
  },
  contact: {
    address: import.meta.env.VITE_STORE_ADDRESS || "",
    phone: import.meta.env.VITE_STORE_PHONE || "",
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "",
    email: import.meta.env.VITE_STORE_EMAIL || "",
  },
};
