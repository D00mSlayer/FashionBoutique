import { SiInstagram, SiFacebook, SiWhatsapp } from "react-icons/si";
import { MapPin, Phone, Mail } from "lucide-react";
import { config } from "@shared/config";

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-semibold mb-4">Contact Us</h3>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {config.contact.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {config.contact.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {config.contact.email}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Social Media</h3>
          <div className="flex space-x-4">
            <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" 
               className="hover:text-primary">
              <SiInstagram className="h-6 w-6" />
            </a>
            <a href={config.social.facebook} target="_blank" rel="noopener noreferrer"
               className="hover:text-primary">
              <SiFacebook className="h-6 w-6" />
            </a>
            <a href={config.social.whatsapp} target="_blank" rel="noopener noreferrer"
               className="hover:text-primary">
              <SiWhatsapp className="h-6 w-6" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Business Hours</h3>
          <p>All Days: 10:00 AM - 10:00 PM</p>
        </div>
      </div>
    </footer>
  );
}