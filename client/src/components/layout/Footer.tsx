import { SiInstagram, SiFacebook, SiWhatsapp } from "react-icons/si";
import { MapPin, Phone, Mail, Heart } from "lucide-react";
import { config } from "@shared/config";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { trackSocialClick } from "@/lib/analytics";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-semibold mb-4 text-primary">Contact Us</h3>
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {config.contact.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              {config.contact.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              {config.contact.email}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-primary">Connect With Us</h3>
          <div className="flex space-x-5 mb-4">
            <a 
              href={config.social.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors duration-200"
              onClick={() => trackSocialClick('instagram')}
            >
              <SiInstagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </a>
            <a 
              href={config.social.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-200"
              onClick={() => trackSocialClick('facebook')}
            >
              <SiFacebook className="h-6 w-6" />
              <span className="sr-only">Facebook</span>
            </a>
            <a 
              href={config.social.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-200"
              onClick={() => trackSocialClick('whatsapp')}
            >
              <SiWhatsapp className="h-6 w-6" />
              <span className="sr-only">WhatsApp</span>
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-primary">Store Hours</h3>
          <p className="mb-1">Monday - Sunday</p>
          <p className="mb-4">10:00 AM - 10:00 PM</p>
        </div>
      </div>
      
      <Separator className="my-8 container mx-auto opacity-30" />
      
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="mb-4 md:mb-0">
          <p>&copy; {currentYear} Viba Chic. All Rights Reserved.</p>
        </div>
        <div className="flex gap-4 md:gap-8">
          <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors duration-200">
            Terms of Service
          </Link>
          <span className="hidden md:flex items-center text-primary">
            Made with <Heart className="h-3 w-3 mx-1 fill-current" /> in Bangalore
          </span>
        </div>
      </div>
    </footer>
  );
}