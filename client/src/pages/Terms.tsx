import { Link } from "wouter";
import { usePageView } from "@/hooks/use-page-view";

export default function Terms() {
  // Track page view
  usePageView("Terms of Service");
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-primary">Terms of Service</h1>
      
      <div className="prose prose-sm md:prose-base max-w-none">
        <p className="text-lg mb-8">Last Updated: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
        
        <h2>Introduction</h2>
        <p>Welcome to Viba Chic. These Terms of Service ("Terms") govern your use of our website. By accessing our website, you agree to these Terms in full.</p>
        
        <h2>Website Purpose</h2>
        <p>Our website serves as a showcase of products available at our physical store. The website does not offer direct online purchasing capabilities. All products displayed are for informational purposes only.</p>
        
        <h2>Communication Channels</h2>
        <p>Our website provides links to WhatsApp, Instagram, and Facebook for communication purposes. By using these channels to contact us:</p>
        <ul>
          <li>You agree to communicate in a respectful manner</li>
          <li>You understand that response times may vary</li>
          <li>You acknowledge that any communication is subject to the respective platform's terms and policies</li>
        </ul>
        
        <h2>Product Information</h2>
        <p>We strive to provide accurate product information, including descriptions and images. However:</p>
        <ul>
          <li>Product availability is subject to change without notice</li>
          <li>Colors may appear differently depending on your display settings</li>
          <li>Product specifications and prices are only confirmed at the time of purchase in our physical store</li>
          <li>Products marked as "Sold Out" may no longer be available</li>
        </ul>
        
        <h2>Intellectual Property</h2>
        <p>All content on this website, including text, graphics, logos, images, and software, is the property of Viba Chic and is protected by copyright and other intellectual property laws. You may not:</p>
        <ul>
          <li>Reproduce, distribute, or publicly display any content from our website without permission</li>
          <li>Use our content for commercial purposes without our explicit consent</li>
          <li>Modify or create derivative works of our content</li>
        </ul>
        
        <h2>Limitation of Liability</h2>
        <p>Viba Chic is not liable for any damages arising from your use of, or inability to use, our website. This includes but is not limited to direct, indirect, incidental, consequential, and punitive damages.</p>
        
        <h2>Third-Party Links</h2>
        <p>Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of these sites.</p>
        
        <h2>Modifications to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. Your continued use of the website after any changes indicates your acceptance of the revised Terms.</p>
        
        <h2>Governing Law</h2>
        <p>These Terms are governed by the laws of India, specifically those applicable in Karnataka.</p>
        
        <h2>Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us through the information provided in the <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
      </div>
      
      <div className="mt-8">
        <Link to="/" className="text-primary hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}