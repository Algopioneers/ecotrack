import { getCmsPage } from '@/lib/cms';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default async function TermsPage() {
  const cmsData = await getCmsPage('terms');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-grow">
      {/* Corporate Header Node */}
      <div className="bg-navy-900 py-16 sm:py-20 border-b-8 border-primary-500">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {cmsData ? cmsData.title : 'Terms of Service'}
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
                  <h3>1. Logistical Limitations</h3>
                  <p>EcoTrack acts exclusively as the middleware node for dispatching logistics. We do not natively process toxic, biological, or radioactive detritus. Contracted collectors hold autonomous rights to refuse explicitly dangerous anomalies.</p>
                  
                  <h3>2. Wallet and Capital Processing</h3>
                  <p>Subscribed wallets are immutable. Refunds are governed exclusively by verifiable API callbacks proving a failure point on behalf of the collector routing system.</p>
                  
                  <h3>3. ESG Liability</h3>
                  <p>Corporate accounts attempting to manipulate CO₂ equivalency data algorithms will result in an immediate architectural ban across the entire ecosystem.</p>
                </div>
            )}
         </div>
      </div>
      </main>
      <PublicFooter />
    </div>
  );
}
