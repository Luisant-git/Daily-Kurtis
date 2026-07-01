import Breadcrumb from "../components/ui/Breadcrumb";

export function PolicyPage({ title, intro, sections }) {
  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: title }]} />
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3">{title}</h1>
          <p className="text-sm text-neutral-600 mt-3 max-w-2xl">{intro}</p>
          <p className="text-xs text-neutral-500 mt-3">Last updated: 12 March 2026</p>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-2xl text-[#1c1c1c]">{s.title}</h2>
            <p className="text-sm text-neutral-700 leading-[1.85] mt-3 whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </article>
    </div>
  );
}

export const Privacy = () => (
  <PolicyPage
    title="Privacy Policy"
    intro="At Daily Kurtis, your privacy matters. This policy explains how we collect, use and protect your information."
    sections={[
      { title: "Information We Collect", body: "We collect your name, email, phone, shipping address and payment information when you place an order, sign up for our newsletter, or interact with our site. Cookies are used to improve your browsing experience." },
      { title: "How We Use Your Information", body: "We use your data to process orders, communicate updates, personalise your experience, and send marketing emails (only if you opt in). We never sell your data to third parties." },
      { title: "Data Security", body: "All transactions are encrypted using industry-standard SSL technology. We store data on secure servers with restricted access." },
      { title: "Your Rights", body: "You can request access, correction, or deletion of your data at any time by emailing care@dailykurtis.com." },
      { title: "Contact", body: "For privacy questions, write to care@dailykurtis.com." },
    ]}
  />
);

export const Terms = () => (
  <PolicyPage
    title="Terms & Conditions"
    intro="By using the Daily Kurtis website, you agree to the following terms."
    sections={[
      { title: "Use of Site", body: "You agree to use this site for lawful purposes only. You must be 18+ to make a purchase." },
      { title: "Products & Pricing", body: "All prices are in INR and inclusive of GST unless stated otherwise. We reserve the right to modify prices at any time. Colours may vary slightly due to monitor settings." },
      { title: "Orders", body: "Order placement is subject to product availability. We may cancel orders that violate our policies and provide a full refund." },
      { title: "Intellectual Property", body: "All content, designs, and images on this site are the property of Daily Kurtis and may not be reused without permission." },
      { title: "Limitation of Liability", body: "We are not liable for indirect or consequential damages arising from use of the site or products." },
    ]}
  />
);

export const Shipping = () => (
  <PolicyPage
    title="Shipping Policy"
    intro="We ship across India and to 30+ countries worldwide with secure, tracked delivery."
    sections={[
      { title: "Processing Time", body: "Orders are dispatched within 24-48 hours of placement (excluding Sundays and public holidays). You'll receive an email with tracking once shipped." },
      { title: "Domestic Delivery", body: "Standard delivery: 3–5 business days. Express delivery: 1–2 business days. Free shipping on orders over ₹1,499." },
      { title: "International Delivery", body: "Delivery time varies between 7–14 business days depending on destination. Customs duties (if applicable) are paid by the customer." },
      { title: "Tracking", body: "Track your order anytime by logging into your account or via the tracking link in your shipping email." },
    ]}
  />
);

export const Returns = () => (
  <PolicyPage
    title="Returns & Refund Policy"
    intro="We hope you love every Daily Kurtis piece — but if not, here's how to return it."
    sections={[
      { title: "Return Window", body: "Returns are accepted within 15 days of delivery. Items must be unworn, unwashed and with all original tags intact." },
      { title: "How to Initiate a Return", body: "Log in to your account and go to 'My Orders'. Select the item and click 'Return'. A pickup will be scheduled within 48 hours." },
      { title: "Refund Process", body: "Once we receive and inspect the item, refunds are processed within 5–7 business days to your original payment method." },
      { title: "Non-Returnable Items", body: "Innerwear, accessories, and sale items marked 'Final Sale' are not eligible for return." },
      { title: "Exchanges", body: "For size exchanges, raise a return request and place a fresh order for the desired size." },
    ]}
  />
);