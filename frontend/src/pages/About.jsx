import Breadcrumb from "../components/ui/Breadcrumb";

export default function About() {
  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "About Us" }]} />
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3">Welcome to Daily Kurti</h1>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-sm text-neutral-700 leading-[1.85]">
        <section>
          <p>
            At Daily Kurti, we believe that everyday fashion should be effortless, comfortable, and beautifully rooted in tradition. Designed for the modern woman who values both style and convenience, our collections feature lightweight, breathable, and elegant kurtis perfect for daily wear, work, and casual outings.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-[#1c1c1c] mb-4">Our Story & Heritage</h2>
          <p>
            Daily Kurti is an official online brand unit of Rathna Readymades, a trusted name in retail apparel based in Rasipuram, Tamil Nadu.
          </p>
          <p className="mt-4">
            With years of experience in sourcing high-quality fabrics and understanding Indian fashion needs, our parent business—Rathna Readymades (alongside our retail division Magalir Mattum)—has built a strong reputation for durability, comfort, and value.
          </p>
          <p className="mt-4">
            To bring our handpicked collections beyond our physical store directly to your doorstep, we launched dailykurtis.com—making high-quality daily wear accessible across India with just a few clicks.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-[#1c1c1c] mb-4">Why Choose Daily Kurti?</h2>
          <p><strong>Comfort First:</strong> Crafted using soft, skin-friendly fabrics like premium cotton, rayon, and breathable blends designed to keep you comfortable all day long.</p>
          <p className="mt-4"><strong>Versatile Designs:</strong> From subtle ethnic prints and contemporary cuts to vibrant casual styles, our designs seamlessly transition from office wear to daily home routines.</p>
          <p className="mt-4"><strong>Uncompromised Quality:</strong> Backed by the retail heritage of Rathna Readymades, every product undergoes strict quality checks before shipping.</p>
          <p className="mt-4"><strong>Affordable Fashion:</strong> We bring you trendy, durable apparel at transparent and pocket-friendly prices.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-[#1c1c1c] mb-4">Registered Business Details</h2>
          <p>For customer support, order inquiries, or business correspondence, you can reach out to our legal business entity:</p>
          <div className="mt-4">
            <p><strong>Legal Entity Name:</strong> Rathna Readymades</p>
            <p><strong>Brand Name:</strong> Daily Kurti</p>
            <p><strong>Retail Outlet / Unit:</strong> Magalir Mattum</p>
            <p><strong>Registered Address:</strong> 38, Chinna Agraharam, Rasipuram - 637408, Namakkal District, Tamil Nadu, India.</p>
            <p><strong>Customer Support Email:</strong> support@dailykurtis.com</p>
            <p><strong>Phone / WhatsApp:</strong> +91 98948 22357</p>
          </div>
        </section>
      </article>
    </div>
  );
}
