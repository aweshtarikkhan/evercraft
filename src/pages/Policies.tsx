import React from "react";

const pageStyle: React.CSSProperties = {
  padding: "100px 24px 60px",
  maxWidth: 800,
  margin: "0 auto",
  color: "#2D1B10",
  lineHeight: 1.8,
  fontFamily: "'Inter', sans-serif"
};

const titleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: "#730000",
  marginBottom: 24,
  borderBottom: "2px solid rgba(115,0,0,0.1)",
  paddingBottom: 16
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#2D1B10",
  marginTop: 32,
  marginBottom: 12
};

const listStyle: React.CSSProperties = {
  marginLeft: 20,
  marginBottom: 16
};

export function PrivacyPolicyPage() {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Privacy Policy</h1>
      <p><strong>EverCraft Publications</strong> ("we", "our", "us") respects your privacy and is committed to protecting the personal information of our authors, readers, and website visitors. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our publishing services.</p>

      <h2 style={sectionTitleStyle}>1. Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      <ul style={listStyle}>
        <li>Name, email address, phone number, and postal address</li>
        <li>Manuscripts and content submitted for publishing</li>
        <li>Payment and billing information</li>
        <li>Website usage data (cookies, IP address, browser type, etc.)</li>
      </ul>

      <h2 style={sectionTitleStyle}>2. How We Use Your Information</h2>
      <p>We use the information to:</p>
      <ul style={listStyle}>
        <li>Provide publishing and related services</li>
        <li>Communicate regarding manuscripts, orders, and services</li>
        <li>Process payments and invoices</li>
        <li>Improve our website and services</li>
        <li>Send updates, newsletters, or promotional information (only with consent)</li>
      </ul>

      <h2 style={sectionTitleStyle}>3. Manuscript & Content Confidentiality</h2>
      <p>All manuscripts submitted to EverCraft Publications are treated as confidential. We do not share, publish, or distribute submitted material without the author’s permission or agreement.</p>

      <h2 style={sectionTitleStyle}>4. Sharing of Information</h2>
      <p>We do not sell personal information. Information may be shared only with:</p>
      <ul style={listStyle}>
        <li>Printing partners</li>
        <li>Distribution partners</li>
        <li>Payment service providers</li>
        <li>Legal authorities if required by law</li>
      </ul>

      <h2 style={sectionTitleStyle}>5. Cookies</h2>
      <p>Our website may use cookies to improve user experience and analyze website traffic.</p>

      <h2 style={sectionTitleStyle}>6. Data Security</h2>
      <p>We take reasonable steps to protect personal information from unauthorized access, loss, or misuse.</p>

      <h2 style={sectionTitleStyle}>7. Third-Party Links</h2>
      <p>Our website may contain links to external websites. We are not responsible for their privacy practices.</p>

      <h2 style={sectionTitleStyle}>8. Changes to Policy</h2>
      <p>EverCraft Publications may update this policy at any time. Updated versions will be posted on this page.</p>

      <h2 style={sectionTitleStyle}>9. Contact</h2>
      <p>For any privacy-related queries, contact:<br/>
      EverCraft Publications<br/>
      Email: evercraft2026@gmail.com</p>

      <br/><br/>
      <h1 style={titleStyle}>Disclaimer Policy</h1>
      <p>The information provided on this website is for general informational purposes only. EverCraft Publications makes every effort to ensure accuracy but does not guarantee that all information is complete, current, or error-free.</p>

      <h2 style={sectionTitleStyle}>1. Publishing Services Disclaimer</h2>
      <p>EverCraft Publications provides publishing, editing, design, printing, distribution, and promotional services. We do not guarantee book sales, bestseller status, or commercial success.</p>

      <h2 style={sectionTitleStyle}>2. Author Responsibility</h2>
      <p>Authors are solely responsible for the content submitted for publishing, including:</p>
      <ul style={listStyle}>
        <li>Originality of work</li>
        <li>Copyright permissions</li>
        <li>Legal compliance</li>
      </ul>
      <p>EverCraft Publications is not responsible for claims arising from the content of any book.</p>

      <h2 style={sectionTitleStyle}>3. Third-Party Platforms</h2>
      <p>Books may be listed on third-party platforms such as Amazon, Flipkart, or bookstores. We are not responsible for:</p>
      <ul style={listStyle}>
        <li>Platform policies</li>
        <li>Listing delays</li>
        <li>Removal of listings</li>
        <li>Sales performance</li>
      </ul>

      <h2 style={sectionTitleStyle}>4. External Links</h2>
      <p>Our website may contain links to third-party websites. We are not responsible for their content or privacy practices.</p>

      <h2 style={sectionTitleStyle}>5. Changes</h2>
      <p>EverCraft Publications reserves the right to modify this disclaimer at any time.</p>

      <br/><br/>
      <h1 style={titleStyle}>Copyright Policy</h1>
      <p>EverCraft Publications respects intellectual property rights and expects authors and users to do the same.</p>

      <h2 style={sectionTitleStyle}>1. Author Ownership</h2>
      <p>Unless otherwise agreed in writing, copyright of the manuscript remains with the author.</p>

      <h2 style={sectionTitleStyle}>2. Permission to Publish</h2>
      <p>By submitting a manuscript, the author confirms that:</p>
      <ul style={listStyle}>
        <li>The work is original</li>
        <li>The author owns the rights</li>
        <li>No copyright is violated</li>
      </ul>

      <h2 style={sectionTitleStyle}>3. Use by EverCraft Publications</h2>
      <p>EverCraft Publications may use the following for promotional purposes:</p>
      <ul style={listStyle}>
        <li>Book title</li>
        <li>Author name</li>
        <li>Book cover</li>
        <li>Description / summary</li>
      </ul>

      <h2 style={sectionTitleStyle}>4. Copyright Complaints</h2>
      <p>If you believe any content published through EverCraft violates copyright, contact us with:</p>
      <ul style={listStyle}>
        <li>Your name</li>
        <li>Proof of ownership</li>
        <li>Details of the content</li>
      </ul>
      <p>We will review and take appropriate action.</p>

      <h2 style={sectionTitleStyle}>5. Unauthorized Use</h2>
      <p>No content from this website may be copied, reproduced, or distributed without permission.</p>
    </div>
  );
}

export function TermsConditionsPage() {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Terms & Conditions</h1>
      <p>By using this website or our publishing services, you agree to the following terms.</p>

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

      <h2 style={sectionTitleStyle}>6. Payments</h2>
      <p>All payments must be made as per invoice / agreement. Services may be paused if payment is pending.</p>

      <h2 style={sectionTitleStyle}>7. Intellectual Property</h2>
      <p>Copyright remains with the author unless otherwise agreed in writing. EverCraft Publications may display book cover, title, and author name for promotional purposes.</p>

      <h2 style={sectionTitleStyle}>8. Limitation of Liability</h2>
      <p>EverCraft Publications is not responsible for:</p>
      <ul style={listStyle}>
        <li>Sales performance</li>
        <li>Marketplace decisions</li>
        <li>Delays caused by third parties</li>
      </ul>

      <h2 style={sectionTitleStyle}>9. Termination</h2>
      <p>Services may be terminated if:</p>
      <ul style={listStyle}>
        <li>Terms are violated</li>
        <li>Payment not made</li>
        <li>False information provided</li>
      </ul>

      <h2 style={sectionTitleStyle}>10. Governing Law</h2>
      <p>These terms are governed by the laws of India. Jurisdiction: Bhopal, Madhya Pradesh, India.</p>
    </div>
  );
}

export function RefundPolicyPage() {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Refund Policy</h1>
      <p>EverCraft Publications provides customized publishing services. Due to the nature of the work, refunds are subject to the following conditions.</p>

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
        <li>Listing created on marketplace</li>
      </ul>

      <h2 style={sectionTitleStyle}>4. Printing Orders</h2>
      <p>Printed books cannot be returned unless there is a manufacturing defect.</p>

      <h2 style={sectionTitleStyle}>5. Marketplace Sales</h2>
      <p>Books sold through Amazon / Flipkart / bookstores follow the return policy of those platforms.</p>

      <h2 style={sectionTitleStyle}>6. Exceptional Cases</h2>
      <p>Refunds, if any, will be decided by EverCraft Publications management on a case-to-case basis.</p>

      <h2 style={sectionTitleStyle}>7. Processing Time</h2>
      <p>Approved refunds will be processed within 7–14 working days.</p>

      <br/><br/>
      <h1 style={titleStyle}>Shipping & Delivery Policy</h1>
      <p>This policy applies to printed books and physical materials ordered through EverCraft Publications.</p>

      <h2 style={sectionTitleStyle}>1. Printing Orders</h2>
      <p>Books are printed after order confirmation or as per publishing agreement.</p>

      <h2 style={sectionTitleStyle}>2. Delivery Time</h2>
      <p>Delivery time may vary depending on:</p>
      <ul style={listStyle}>
        <li>Printing schedule</li>
        <li>Order quantity</li>
        <li>Location</li>
        <li>Courier service</li>
      </ul>
      <p>Typical delivery time: 7–21 working days.</p>

      <h2 style={sectionTitleStyle}>3. Shipping Charges</h2>
      <p>Shipping charges may be included in the package or charged separately as per agreement.</p>

      <h2 style={sectionTitleStyle}>4. Delivery Partners</h2>
      <p>We use third-party courier / logistics services. Delays caused by courier companies are beyond our control.</p>

      <h2 style={sectionTitleStyle}>5. Damaged Shipment</h2>
      <p>If books are received damaged, inform us within 3 days with photos. Replacement may be provided if damage occurred during shipping.</p>

      <h2 style={sectionTitleStyle}>6. International Shipping</h2>
      <p>International delivery, if applicable, will be charged separately.</p>

      <h2 style={sectionTitleStyle}>7. Contact</h2>
      <p>For delivery related queries:<br/>
      EverCraft Publications<br/>
      Email: evercraft2026@gmail.com</p>
    </div>
  );
}
