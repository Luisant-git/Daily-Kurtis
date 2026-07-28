import Breadcrumb from "../components/ui/Breadcrumb";

export function PolicyPage({ title, intro, sections }) {
  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: title }]} />
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3">{title}</h1>
          <p className="text-sm text-neutral-600 mt-3 max-w-2xl whitespace-pre-line">{intro}</p>
          <p className="text-xs text-neutral-500 mt-3">Effective Date: July 28, 2026</p>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-2xl text-[#1c1c1c]">{s.title}</h2>
            <div className="text-sm text-neutral-700 leading-[1.85] mt-3">{s.body}</div>
          </section>
        ))}
      </article>
    </div>
  );
}

export const Privacy = () => (
  <PolicyPage
    title="Privacy Policy"
    intro="At Daily Kurti (a unit of Rathna Readymades), accessible from https://dailykurtis.com/, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Daily Kurti and how we use it."
    sections={[
      { title: "1. Information We Collect", body: <>
        <p>We collect personal information that you voluntarily provide to us when you register on the website, place an order, subscribe to our newsletter, or contact us. This includes:</p>
        <p className="mt-4"><strong>Personal Details:</strong> Name, email address, phone number, shipping and billing address.</p>
        <p className="mt-4"><strong>Payment Details:</strong> Payment details processed securely through our authorized payment gateways (we do not store raw card or banking credentials on our servers).</p>
        <p className="mt-4"><strong>Automated Data:</strong> IP address, browser type, device information, and browsing activity collected via cookies.</p>
      </> },
      { title: "2. How We Use Your Information", body: <>
        <p>We use the information we collect in various ways, including to:</p>
        <ul className="list-disc pl-5 mt-4 space-y-2">
          <li>Process and fulfill your product orders and manage deliveries.</li>
          <li>Communicate with you regarding order updates, customer service, and promotional offers (via Email, SMS, or WhatsApp).</li>
          <li>Improve, personalize, and expand our website offerings.</li>
          <li>Prevent fraudulent transactions and ensure website security.</li>
        </ul>
      </> },
      { title: "3. Data Protection & Sharing", body: <p>We do not sell, trade, or rent your personal information to third parties. We may share necessary data with trusted service providers who assist us in operating our website, conducting our business, or serving our users (such as logistics partners and payment processors), as long as those parties agree to keep this information confidential.</p> },
      { title: "4. Contact Us", body: <>
        <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at:</p>
        <div className="mt-4">
          <p><strong>Legal Entity:</strong> Rathna Readymades</p>
          <p><strong>Brand Name:</strong> Daily Kurti</p>
          <p><strong>Address:</strong> 38, Chinna Agraharam, Rasipuram - 637408, Namakkal District, Tamil Nadu, India.</p>
          <p><strong>Email:</strong> support@dailykurtis.com</p>
          <p><strong>Phone:</strong> +91 98948 22357</p>
        </div>
      </> },
    ]}
  />
);

export const Terms = () => (
  <PolicyPage
    title="Terms & Conditions"
    intro={"Welcome to Daily Kurti! These terms and conditions outline the rules and regulations for the use of Daily Kurti's Website, located at https://dailykurtis.com/.\n\nDaily Kurti is an official e-commerce brand owned and operated by Rathna Readymades."}
    sections={[
      { title: "1. General Conditions", body: <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use Daily Kurti if you do not agree to accept all of the terms and conditions stated on this page.</p> },
      { title: "2. Intellectual Property Rights", body: <p>Unless otherwise stated, Rathna Readymades and/or its licensors own the intellectual property rights for all material on Daily Kurti. All intellectual property rights are reserved. You may access this from Daily Kurti for your own personal use subjected to restrictions set in these terms and conditions.</p> },
      { title: "3. Product & Pricing Information", body: <>
        <p>We make every effort to display the colors and images of our products as accurately as possible. However, actual colors may vary slightly due to screen resolution and lighting.</p>
        <p className="mt-4">All prices are listed in Indian Rupees (INR) and are inclusive/exclusive of taxes as indicated during checkout.</p>
        <p className="mt-4">We reserve the right to modify prices or discontinue products at any time without prior notice.</p>
      </> },
      { title: "4. User Accounts", body: <p>When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p> },
      { title: "5. Governing Law", body: <p>These Terms shall be governed and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Namakkal / Tamil Nadu, India.</p> },
    ]}
  />
);

export const Shipping = () => (
  <PolicyPage
    title="Shipping Policy"
    intro="We ship across India and to 30+ countries worldwide with secure, tracked delivery."
    sections={[
      { title: "Processing Time", body: <p>Orders are dispatched within 24-48 hours of placement (excluding Sundays and public holidays). You'll receive an email with tracking once shipped.</p> },
      { title: "Domestic Delivery", body: <p>Standard delivery: 3–5 business days. Express delivery: 1–2 business days. Free shipping on orders over ₹1,499.</p> },
      { title: "International Delivery", body: <p>Delivery time varies between 7–14 business days depending on destination. Customs duties (if applicable) are paid by the customer.</p> },
      { title: "Tracking", body: <p>Track your order anytime by logging into your account or via the tracking link in your shipping email.</p> },
    ]}
  />
);

export const Returns = () => (
  <PolicyPage
    title="Return & Refund Policy"
    intro="Thank you for shopping at Daily Kurti (a unit of Rathna Readymades). We value your trust and strive to deliver high-quality apparel."
    sections={[
      { title: "1. Returns & Exchanges", body: <>
        <p><strong>Eligibility:</strong> Products can be returned or exchanged within 7 days from the date of delivery.</p>
        <p className="mt-4"><strong>Condition:</strong> To be eligible for a return or exchange, items must be unused, unwashed, in their original condition, and with all tags and original packaging intact.</p>
        <p className="mt-4"><strong>Non-Returnable Items:</strong> Customized items, final sale/clearance items, or damaged products due to customer misuse are non-returnable.</p>
      </> },
      { title: "2. Process for Returns/Exchanges", body: <>
        <p>Contact our customer support team at support@dailykurtis.com or +91 98948 22357 within 7 days of receiving your package.</p>
        <p className="mt-4">Share your Order ID, reason for return, and photos/videos of the product (if damaged or incorrect).</p>
        <p className="mt-4">Once approved, our team will arrange a reverse pickup (if applicable in your area) or guide you to send the package back to our official address:</p>
        <div className="mt-4 pl-4 border-l-2 border-[#E9E5E5]">
          <p>Rathna Readymades (Daily Kurti)</p>
          <p>38, Chinna Agraharam, Rasipuram - 637408,</p>
          <p>Namakkal District, Tamil Nadu, India.</p>
        </div>
      </> },
      { title: "3. Refunds", body: <>
        <p><strong>Inspection:</strong> Once we receive your returned item, our quality team will inspect it and notify you of the approval or rejection of your refund.</p>
        <p className="mt-4"><strong>Refund Method:</strong> Upon approval, refunds will be processed to your original payment method within 5 to 7 business days (or via Bank Transfer/UPI for Cash on Delivery orders).</p>
        <p className="mt-4"><strong>Shipping Charges:</strong> Original shipping charges (if any) are non-refundable unless the return is due to a defect or error on our part.</p>
      </> },
    ]}
  />
);