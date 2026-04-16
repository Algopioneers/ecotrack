import { getCmsPage } from '@/lib/cms';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default async function ContactPage() {
  const cmsData = await getCmsPage('contact');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-grow">
      {/* Corporate Hero Section */}
      <div className="bg-navy-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {cmsData ? cmsData.title : 'Contact Operations'}
          </h1>
          <p className="mt-6 text-lg leading-8 text-navy-200 max-w-2xl mx-auto">
            {cmsData?.metaDescription || 'Our enterprise support team is thoroughly available to assist with logistics, integration, and platform concerns.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        {cmsData ? (
           <div className="prose prose-lg prose-navy max-w-none" dangerouslySetInnerHTML={{ __html: cmsData.content }} />
        ) : (
          <div className="space-y-24">
            {/* 3-Column Corporate INFO Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-navy-50 rounded-2xl p-10 border border-navy-100 text-center hover:border-primary-300 transition-colors">
                <div className="w-14 h-14 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Corporate Headquarters</h3>
                <p className="text-navy-600">EcoTrack House, Green District<br/>Victoria Island, Lagos</p>
              </div>
              
              <div className="bg-navy-50 rounded-2xl p-10 border border-navy-100 text-center hover:border-primary-300 transition-colors">
                <div className="w-14 h-14 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Email Operations</h3>
                <p className="text-navy-600">corporate@ecotrack.africa<br/>support@ecotrack.africa</p>
              </div>
              
              <div className="bg-navy-50 rounded-2xl p-10 border border-navy-100 text-center hover:border-primary-300 transition-colors">
                <div className="w-14 h-14 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Priority Lines</h3>
                <p className="text-navy-600">+234 (0) 800 123 4567<br/>+234 (0) 900 987 6543</p>
              </div>
            </div>

            {/* Split Contact Form & Map Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 bg-white shadow-xl shadow-navy-100 rounded-3xl border border-navy-100 overflow-hidden">
              
              {/* Left Side: Enterprise Contact Form */}
              <div className="p-10 lg:p-14">
                <h2 className="text-3xl font-bold text-navy-900 mb-8">Submit Corporate Inquiry</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy-800">First Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-navy-50 rounded-lg border border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-navy-900" placeholder="Jane" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy-800">Last Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-navy-50 rounded-lg border border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-navy-900" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy-800">Organization or Email</label>
                    <input type="email" className="w-full px-4 py-3 bg-navy-50 rounded-lg border border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-navy-900" placeholder="jane@enterprise.co" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy-800">Inquiry Details</label>
                    <textarea rows={5} className="w-full px-4 py-3 bg-navy-50 rounded-lg border border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none text-navy-900" placeholder="Describe the operational logistics you require..."></textarea>
                  </div>
                  <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-4 rounded-lg transition-colors shadow-lg shadow-primary-600/20">
                    Dispatch Message
                  </button>
                </form>
              </div>

              {/* Right Side: Geocoded iFrame Map Placeholder */}
              <div className="relative min-h-[400px] lg:h-auto bg-navy-100">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d126839.2934149666!2d3.2982830843181824!3d6.5562725458020585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b285c4f39ce%3A0xd3362a98f1fdb657!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1714000000000!5m2!1sen!2sus" 
                  className="absolute inset-0 w-full h-full border-0 grayscale opacity-90 contrast-125" 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
      <PublicFooter />
    </div>
  );
}
