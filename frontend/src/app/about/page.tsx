import { getCmsPage } from '@/lib/cms';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default async function AboutPage() {
  const cmsData = await getCmsPage('about');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-grow">
      {/* Corporate Hero Section */}
      <div className="bg-navy-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {cmsData ? cmsData.title : 'About EcoTrack'}
          </h1>
          <p className="mt-6 text-lg leading-8 text-navy-200 max-w-2xl mx-auto">
            {cmsData?.metaDescription || 'Pioneering smart waste management solutions to build a cleaner, sustainable corporate and public ecosystem.'}
          </p>
        </div>
      </div>

      {cmsData ? (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
           {/* Allow CMS content to map directly into Tailwind Typography */}
           <div className="prose prose-lg prose-navy max-w-none" dangerouslySetInnerHTML={{ __html: cmsData.content }} />
        </div>
      ) : (
        <>
          {/* Mission & Organization Overview */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl mb-6">Corporate Mission</h2>
                <p className="text-lg text-navy-600 mb-6 leading-relaxed">
                  Founded with a clear corporate vision to formalize and digitize waste collection, EcoTrack empowers regional communities and enterprises alike. We provide the crucial digital infrastructure needed to transform liability waste into a fully sustainable circular physical economy.
                </p>
                <p className="text-lg text-navy-600 leading-relaxed">
                  By seamlessly integrating reliable waste generators directly with verified, professional collectors, we mitigate logistical inefficiencies, limit environmental damage, and structure equitable ecosystems that heavily reward recycling and green corporate policies.
                </p>
              </div>
              
              {/* Corporate Image Placeholder */}
              <div className="relative h-96 rounded-2xl overflow-hidden bg-navy-50 border border-navy-100 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                   <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                   </svg>
                </div>
                <h3 className="text-2xl font-bold text-navy-900">Enterprise Operations</h3>
                <p className="text-navy-600 mt-2">Connecting stakeholders via NextGen architecture.</p>
              </div>
            </div>
          </div>

          {/* Core Values Grid */}
          <div className="bg-navy-50 py-24 border-t border-navy-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Core Directives</h2>
                <p className="mt-4 text-lg text-navy-600">The fundamental operating principles determining our day-to-day corporate logic.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { title: "Net Sustainability", desc: "Every logistical action focuses on generating a provable, net-positive environmental impact.", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" },
                  { title: "Operational Transparency", desc: "Open, traceable data streams from waste scheduling endpoints through to fleet routing and payments.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                  { title: "Technological Innovation", desc: "Using advanced cloud provisioning, real-time geocoding, and fintech integration to neutralize legacy hurdles.", icon: "M13 10V3L4 14h7v7l9-11h-7z" }
                ].map((val, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-2xl shadow-sm border border-navy-200">
                    <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={val.icon} />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-3">{val.title}</h3>
                    <p className="text-navy-600 leading-relaxed text-sm">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      </main>
      <PublicFooter />
    </div>
  );
}
