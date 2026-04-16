import { getCmsPage } from '@/lib/cms';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default async function FAQPage() {
  const cmsData = await getCmsPage('faq');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-grow">
      {/* Corporate Hero Section */}
      <div className="bg-navy-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {cmsData ? cmsData.title : 'Knowledge Base'}
          </h1>
          <p className="mt-6 text-lg leading-8 text-navy-200 max-w-2xl mx-auto">
            {cmsData?.metaDescription || 'Detailed operational clarifications, technical requirements, and service architecture answers.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-24">
        {cmsData ? (
           <div className="prose prose-lg prose-navy max-w-none" dangerouslySetInnerHTML={{ __html: cmsData.content }} />
        ) : (
          <div className="space-y-12">
             <div className="border-b border-navy-100 pb-5">
               <h2 className="text-2xl font-bold text-navy-900">General Operations</h2>
             </div>
             <div className="space-y-6">
                {[
                  { q: "How is fleet capacity scaled?", a: "EcoTrack manages an elasticity layer of vetted independent collectors paired directly with dynamic zones to prevent regional log-jams." },
                  { q: "What is your data retention protocol?", a: "All transactions and active geolocations are strictly logged in an immutable backend via PostgreSQL and completely bound by NDA-like consumer limits." },
                  { q: "Do you integrate with corporate ESG API architectures?", a: "Yes. Our standard payloads emit standardized CO₂ footprint equivalencies designed for rapid integration with ESG compliance tools." },
                  { q: "How is wallet ledger handled?", a: "All node transactions resolve against Paystack architecture enforcing PCI-DSS complaint vaulting." }
                ].map((faq, idx) => (
                  <div key={idx} className="bg-navy-50 rounded-xl p-8 border border-navy-100">
                    <h3 className="text-lg font-bold text-navy-900 mb-3">{faq.q}</h3>
                    <p className="text-navy-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
      </main>
      <PublicFooter />
    </div>
  );
}
