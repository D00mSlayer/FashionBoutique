import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-primary">Privacy Policy</h1>
      
      <div className="prose prose-sm md:prose-base max-w-none">
        <p className="text-lg mb-8">Last Updated: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
        
        <h2>Introduction</h2>
        <p>At Viba Chic, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.</p>
        
        <h2>Information We Collect</h2>
        <p>When you visit our website, we may collect certain information automatically, including:</p>
        <ul>
          <li>Browser type and device information</li>
          <li>IP address and location data</li>
          <li>Pages viewed and time spent on our website</li>
          <li>Referring website or source</li>
        </ul>
        
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Improve our website and your browsing experience</li>
          <li>Analyze website usage to enhance our product offerings</li>
          <li>Understand our audience better</li>
        </ul>
        
        <h2>Communication and Third-Party Services</h2>
        <p>Our website provides links to third-party services such as WhatsApp, Instagram, and Facebook for communication purposes. Please note that when you interact with us through these platforms, your communication is subject to their respective privacy policies:</p>
        <ul>
          <li><a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">WhatsApp Privacy Policy</a></li>
          <li><a href="https://help.instagram.com/519522125107875" target="_blank" rel="noopener noreferrer">Instagram Privacy Policy</a></li>
          <li><a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer">Facebook Privacy Policy</a></li>
        </ul>
        
        <h2>Cookies and Similar Technologies</h2>
        <p>Our website may use cookies and similar technologies to enhance your browsing experience. You can manage cookie preferences through your browser settings.</p>
        
        <h2>Information Security</h2>
        <p>We implement reasonable security measures to protect your information. However, no internet transmission is completely secure, so we cannot guarantee absolute security.</p>
        
        <h2>Children's Privacy</h2>
        <p>Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children.</p>
        
        <h2>Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
        
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us through the information provided in the <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
      </div>
      
      <div className="mt-8">
        <Link to="/" className="text-primary hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}