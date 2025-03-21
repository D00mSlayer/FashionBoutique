import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { usePageView } from "@/hooks/use-page-view";
import { config } from "@shared/config";

export default function Contact() {
  // Track page view
  usePageView("Contact Us");
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Visit Our Store</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <p>{config.contact.address}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <p>{config.contact.phone}</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <p>{config.contact.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p>All Days: 11:00 AM - 10:00 PM</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <div className="aspect-square rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12766.92234038767!2d77.63242978403711!3d12.918171761118204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15205afeb129%3A0x8089343095d075d3!2sViba%20Chic%20-%20Women&#39;s%20Korean%20and%20Western%20Wear!5e0!3m2!1sen!2sin!4v1742472422528!5m2!1sen!2sin" 
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}