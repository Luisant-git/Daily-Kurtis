import { useForm } from "react-hook-form";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "../components/ui/Breadcrumb";
import Button from "../components/ui/Button";
import { SITE } from "../data/site.js";

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const onSubmit = (d) => {
    console.log(d);
    toast.success("Message sent! We'll reply within 24 hours.");
    reset();
  };

  return (
    <div>
      <div className="bg-[#FAF6F4] border-b border-[#E9E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3">We'd love to hear from you</h1>
          <p className="text-sm text-neutral-600 mt-3 max-w-xl">
            Questions, feedback, styling help — our team is here to help you Monday to Saturday, 10am–7pm IST.
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1fr_400px] gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#E9E5E5] rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-2xl">Send us a message</h2>
          <p className="text-sm text-neutral-500 mt-1">We'll respond within 24 hours.</p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Input label="Your Name" error={errors.name?.message}>
              <input className="input" {...register("name", { required: "Required" })} />
            </Input>
            <Input label="Email" error={errors.email?.message}>
              <input type="email" className="input" {...register("email", { required: "Required" })} />
            </Input>
            <Input label="Subject" full error={errors.subject?.message}>
              <input className="input" {...register("subject", { required: "Required" })} />
            </Input>
            <Input label="Message" full error={errors.message?.message}>
              <textarea rows={5} className="input !h-auto !py-3 !rounded-2xl" {...register("message", { required: "Required" })} />
            </Input>
          </div>

          <Button size="lg" type="submit" className="mt-6">
            Send Message <Send size={14} />
          </Button>
          <style>{`.input { width:100%; height:44px; padding:0 14px; background:#fff; border:1px solid #E9E5E5; border-radius:9999px; font-size:14px; outline:none; } .input:focus{ border-color:#800000;}`}</style>
        </form>

        {/* Info */}
        <aside className="space-y-4">
          <InfoCard Icon={Phone} title="Call Us" lines={[SITE.phone, "Mon - Sat, 10am - 7pm"]} />
          <InfoCard Icon={Mail} title="Email" lines={[SITE.email, "Reply within 24 hrs"]} />
          <InfoCard Icon={MapPin} title="Visit Our Studio" lines={[SITE.address]} />
          <InfoCard Icon={MessageCircle} title="WhatsApp" lines={["+91 98765 43210", "Quickest response"]} />
        </aside>
      </section>

      {/* Map placeholder */}
      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/7] rounded-2xl overflow-hidden border border-[#E9E5E5] bg-[#FAF6F4]">
          <iframe
            title="Map"
            className="w-full h-full"
            src="https://www.openstreetmap.org/export/embed.html?bbox=72.82%2C19.05%2C72.86%2C19.08&layer=mapnik&marker=19.06%2C72.84"
          />
          <div className="absolute bottom-5 left-5 bg-white rounded-xl px-5 py-3 shadow-lg">
            <p className="text-xs text-[#D4AF37] uppercase tracking-wider">Daily Kurtis Studio</p>
            <p className="text-sm font-medium mt-0.5">Bandra West, Mumbai</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Input({ label, children, full, error }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs uppercase tracking-wider text-neutral-500 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-[#DC2626] mt-1">{error}</p>}
    </div>
  );
}

function InfoCard({ Icon, title, lines }) {
  return (
    <div className="bg-white border border-[#E9E5E5] rounded-2xl p-5 flex gap-4 hover:border-[#D4AF37] transition">
      <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFF8F8] text-[#800000] flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-neutral-500">{title}</p>
        {lines.map((l, i) => (
          <p key={i} className={`${i === 0 ? "text-sm font-medium text-[#1c1c1c] mt-1" : "text-xs text-neutral-500"}`}>{l}</p>
        ))}
      </div>
    </div>
  );
}