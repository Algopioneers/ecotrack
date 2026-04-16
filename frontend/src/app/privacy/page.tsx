import { getCmsPage } from '@/lib/cms';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default async function TermsLayoutPage() {
  const cmsData = await getCmsPage('privacy');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-grow">
      {/* Corporate Header Node */}
      <div className="bg-navy-900 py-16 sm:py-20 border-b-8 border-primary-500">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {cmsData ? cmsData.title : 'Corporate Privacy Policy'}
          </h1>
          <p className="text-sm text-navy-300">
            Last Updated: Q2 - 2026 Fiscal Cycle
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
         <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-10 md:p-14">
            {cmsData ? (
               <div className="prose prose-navy max-w-none" dangerouslySetInnerHTML={{ __html: cmsData.content }} />
            ) : (
                <div className="prose prose-navy max-w-none">
                  <h3>1. Logistical Data Scavenging</h3>
                  <p>EcoTrack firmly encrypts all mapping geotraces derived from independent collector paths or civilian household locations. Nodes exist purely within active sessions.</p>
                  
                  <h3>2. Commercial Disclosure</h3>
                  <p>Client metadata strictly assists route optimization arrays. The core ledger operates under strict Zero-Trust paradigms against 3rd party advertorial scraping.</p>
                  
                  <h3>3. Gateway Compliance</h3>
                  <p>Wallet and transaction hashes natively hit external compliance borders (Paystack | Flutterwave). We parse secure tokens exclusively.</p>
                </div>
            )}
         </div>
      </div>
      </main>
      <PublicFooter />
    </div>
  );
}
