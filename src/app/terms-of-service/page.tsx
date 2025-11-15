
import { Header } from '@/components/header';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12 md:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
              Terms of Service
            </h1>
            <div className="space-y-6 text-muted-foreground">
              <p>Welcome to AS PRODUCTION. These terms and conditions outline the rules and regulations for the use of AS PRODUCTION's Website, located at your-website.com.</p>
              <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use AS PRODUCTION if you do not agree to take all of the terms and conditions stated on this page.</p>

              <h2 className="text-2xl font-bold text-foreground pt-4">Cookies</h2>
              <p>We employ the use of cookies. By accessing AS PRODUCTION, you agreed to use cookies in agreement with the AS PRODUCTION's Privacy Policy.</p>
              <p>Most interactive websites use cookies to let us retrieve the user's details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>

              <h2 className="text-2xl font-bold text-foreground pt-4">License</h2>
              <p>Unless otherwise stated, AS PRODUCTION and/or its licensors own the intellectual property rights for all material on AS PRODUCTION. All intellectual property rights are reserved. You may access this from AS PRODUCTION for your own personal use subjected to restrictions set in these terms and conditions.</p>
              <p>You must not:</p>
              <ul className="list-disc list-inside pl-4">
                <li>Republish material from AS PRODUCTION</li>
                <li>Sell, rent or sub-license material from AS PRODUCTION</li>
                <li>Reproduce, duplicate or copy material from AS PRODUCTION</li>
                <li>Redistribute content from AS PRODUCTION</li>
              </ul>
              <p>This Agreement shall begin on the date hereof.</p>

              <h2 className="text-2xl font-bold text-foreground pt-4">Disclaimer</h2>
              <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
              <ul className="list-disc list-inside pl-4">
                  <li>limit or exclude our or your liability for death or personal injury;</li>
                  <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                  <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                  <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
              </ul>
              <p>As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>

            </div>
          </div>
        </div>
      </main>
      <footer className="py-8 bg-background text-center text-sm text-muted-foreground border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AS PRODUCTION. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
