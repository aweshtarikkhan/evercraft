import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const containerStyle: React.CSSProperties = { 
  maxWidth: 800, 
  margin: "0 auto", 
  padding: "80px 24px 100px", 
  fontFamily: "var(--primary-font, 'Inter', sans-serif)",
  color: "#5C3A21"
};

const headerCardStyle: React.CSSProperties = {
  background: "#730000",
  color: "#FAF5EF",
  padding: "48px 32px",
  borderRadius: "16px",
  boxShadow: "0 20px 40px rgba(115,0,0,0.15)",
  marginBottom: "40px",
  textAlign: "center"
};

const titleStyle: React.CSSProperties = { 
  fontSize: "clamp(32px, 5vw, 48px)", 
  fontWeight: 800, 
  fontFamily: "var(--heading-font, 'Playfair Display', serif)",
  marginBottom: "16px",
  color: "#FAF5EF"
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "18px",
  opacity: 0.9,
  maxWidth: "600px",
  margin: "0 auto",
  lineHeight: 1.6
};

const contentCardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  padding: "48px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  border: "1px solid rgba(115,0,0,0.08)",
  lineHeight: 1.8,
  fontSize: "16px"
};

const sectionTitleStyle: React.CSSProperties = { 
  fontSize: 22, 
  fontWeight: 700, 
  marginTop: 40, 
  marginBottom: 16, 
  color: "#730000",
  fontFamily: "var(--heading-font, 'Playfair Display', serif)",
  borderBottom: "1px solid rgba(115,0,0,0.1)",
  paddingBottom: "8px"
};

const listStyle: React.CSSProperties = { 
  paddingLeft: 24, 
  marginBottom: 24,
  listStyleType: "circle"
};

export function PrivacyPolicyPage() {
  const { settings } = useSettings();

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <h1 style={titleStyle}>{settings.content_privacy_hero_title || "Privacy Policy"}</h1>
        <p style={subtitleStyle}>{settings.content_privacy_hero_subtitle || "Your privacy is important to us. Learn how we protect your personal information."}</p>
      </div>

      <div style={contentCardStyle}>
        <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 32 }}>
          {settings.content_privacy_content || "This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from Evercraft Publications. We use your Personal Information only for providing and improving the Site. By using the Site, you agree to the collection and use of information in accordance with this policy."}
        </p>

        <h2 style={sectionTitleStyle}>1. Information We Collect</h2>
        <p>When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.</p>
        
        <h2 style={sectionTitleStyle}>2. How We Use Your Information</h2>
        <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
        
        <h2 style={sectionTitleStyle}>3. Sharing Your Personal Information</h2>
        <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. We may also share your Personal Information to comply with applicable laws and regulations.</p>

        <h2 style={sectionTitleStyle}>4. Data Retention</h2>
        <p>When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>
        
        <h2 style={sectionTitleStyle}>5. Changes</h2>
        <p>We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.</p>
      </div>
    </div>
  );
}

export function TermsConditionsPage() {
  const { settings } = useSettings();

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <h1 style={titleStyle}>{settings.content_terms_hero_title || "Terms & Conditions"}</h1>
        <p style={subtitleStyle}>{settings.content_terms_hero_subtitle || "Please read these terms and conditions carefully before using our service."}</p>
      </div>

      <div style={contentCardStyle}>
        <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 32 }}>
          {settings.content_terms_content || "By accessing this website we assume you accept these terms and conditions. Do not continue to use Evercraft Publications if you do not agree to take all of the terms and conditions stated on this page."}
        </p>

        <h2 style={sectionTitleStyle}>1. Services</h2>
        <p>EverCraft Publications provides publishing services including editing, design, printing, distribution, and marketing support. Use of these services is subject to agreement between the author and the company.</p>

        <h2 style={sectionTitleStyle}>2. Author Responsibility</h2>
        <p>The author confirms that:</p>
        <ul style={listStyle}>
          <li>The submitted work is original</li>
          <li>The author owns the rights to the content</li>
          <li>The content does not violate copyright, trademark, or law</li>
        </ul>
        <p>The author is solely responsible for any legal claims related to the content.</p>

        <h2 style={sectionTitleStyle}>3. Publishing Agreement</h2>
        <p>Publishing services will begin only after:</p>
        <ul style={listStyle}>
          <li>Acceptance of manuscript</li>
          <li>Agreement on scope of work</li>
          <li>Payment as per proposal</li>
        </ul>

        <h2 style={sectionTitleStyle}>4. Editorial Rights</h2>
        <p>EverCraft Publications reserves the right to suggest edits, formatting, and design changes for quality and publishing standards.</p>

        <h2 style={sectionTitleStyle}>5. Printing & Distribution</h2>
        <p>Printing quantity, format, and distribution channels will be decided as per the agreement with the author. Availability on marketplaces like Amazon / Flipkart depends on platform policies and cannot be guaranteed.</p>

        <h2 style={sectionTitleStyle}>6. Intellectual Property</h2>
        <p>Copyright remains with the author unless otherwise agreed in writing. EverCraft Publications may display book cover, title, and author name for promotional purposes.</p>

        <h2 style={sectionTitleStyle}>7. Governing Law</h2>
        <p>These terms are governed by the laws of India. Jurisdiction: Bhopal, Madhya Pradesh, India.</p>
      </div>
    </div>
  );
}

export function RefundPolicyPage() {
  const { settings } = useSettings();

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <h1 style={titleStyle}>{settings.content_refund_hero_title || "Cancellation & Refund Policy"}</h1>
        <p style={subtitleStyle}>{settings.content_refund_hero_subtitle || "Understanding our refund and cancellation terms."}</p>
      </div>

      <div style={contentCardStyle}>
        <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 32 }}>
          {settings.content_refund_content || "We offer a 7-day money-back guarantee for unused physical book purchases. For publishing services, refunds are subject to the specific terms outlined in your publishing contract."}
        </p>

        <h2 style={sectionTitleStyle}>1. Service-Based Payments</h2>
        <p>Payments made for editing, design, printing, or publishing services are non-refundable once work has started.</p>

        <h2 style={sectionTitleStyle}>2. Before Work Begins</h2>
        <p>If the client cancels before work starts, refund may be given after deducting administrative charges.</p>

        <h2 style={sectionTitleStyle}>3. After Work Has Started</h2>
        <p>No refund will be provided once:</p>
        <ul style={listStyle}>
          <li>Editing has begun</li>
          <li>Design work has started</li>
          <li>ISBN assigned</li>
          <li>Printing initiated</li>
        </ul>

        <h2 style={sectionTitleStyle}>4. Printing Orders</h2>
        <p>Printed books cannot be returned unless there is a manufacturing defect.</p>

        <h2 style={sectionTitleStyle}>5. Marketplace Sales</h2>
        <p>Books sold through Amazon / Flipkart / bookstores follow the return policy of those platforms.</p>

        <h2 style={sectionTitleStyle}>6. Exceptional Cases</h2>
        <p>Refunds, if any, will be decided by EverCraft Publications management on a case-to-case basis. Approved refunds will be processed within 7–14 working days.</p>
      </div>
    </div>
  );
}
