import { SiInstagram, SiFacebook, SiWhatsapp } from "react-icons/si";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-semibold mb-4">Contact Us</h3>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              123 Koramangala, Bangalore - 560034
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              +91 98765 43210
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              info@boutique.com
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Social Media</h3>
          <div className="flex space-x-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
               className="hover:text-primary">
              <SiInstagram className="h-6 w-6" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
               className="hover:text-primary">
              <SiFacebook className="h-6 w-6" />
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
               className="hover:text-primary">
              <SiWhatsapp className="h-6 w-6" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Business Hours</h3>
          <p>Monday - Saturday: 10:00 AM - 8:00 PM</p>
          <p>Sunday: 11:00 AM - 6:00 PM</p>
        </div>
      </div>
    </footer>
  );
}
