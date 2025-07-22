
"use client";

import Link from 'next/link';
import { Logo } from './logo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export function Footer() {
  const footerSections = [
    {
      title: 'Site',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'FAQs', href: '/faq' },
        { label: 'Glossary', href: '/glossary' },
      ],
    },
    {
      title: 'Policies',
      links: [
        { label: 'Cookie Policy', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Use', href: '#' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Contact Us', href: '#' },
        { label: 'Sitemap', href: '#' },
      ],
    },
  ];

  const cookiePolicyContent = (
      <div className="prose dark:prose-invert max-w-none space-y-6 text-foreground/80">
        <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-3">Introduction</h2>
            <p>This Cookie Policy explains how Sugar Connect ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are, why we use them to provide a secure and personalized experience, and outlines your rights to control our use of them.</p>
        </div>
        <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-3">What are cookies?</h2>
            <p>A cookie is a small data file that is placed on your device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information. Cookies set by the website owner (in this case, Sugar Connect) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies".</p>
        </div>
        <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-3">Why do we use cookies?</h2>
            <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our platform. For example, we use cookies to remember your login status and preferences.</p>
        </div>
        <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-3">Types of Cookies We Use</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Strictly Necessary Cookies:</strong> These are essential for you to browse the website and use its features, such as accessing secure areas of the site.</li>
                <li><strong>Performance and Analytics Cookies:</strong> These cookies collect information about how you use our website, like which pages you visited and which links you clicked on. None of this information can be used to identify you. It is all aggregated and, therefore, anonymized. Their sole purpose is to improve website functions.</li>
                <li><strong>Functionality Cookies:</strong> These cookies allow our website to remember choices you have made in the past, like what language you prefer or what your user name and password are so you can automatically log in.</li>
                <li><strong>Marketing Cookies:</strong> These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad. These cookies can share that information with other organizations or advertisers.</li>
            </ul>
        </div>
        <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-3">How can you control cookies?</h2>
            <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your browser. Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser, and from version to version. Please note, however, that if you disable cookies, you may not be able to use all the features of our website.</p>
        </div>
        <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-3">Changes to This Cookie Policy</h2>
            <p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>
        </div>
        <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-3">Contact Us</h2>
            <p>If you have any questions about our use of cookies or other technologies, please email us using the contact form on our website.</p>
        </div>
      </div>
  );

  const privacyPolicyContent = (
    <div className="prose dark:prose-invert max-w-none space-y-6 text-foreground/80">
        <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">1. Introduction</h3>
            <p>This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you use our services. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.</p>
        </div>
        <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">2. Information We Collect</h3>
            <p>We may collect the following types of information: Personal Identification Information (Name, email address, phone number, etc.), Profile Information (age, photos, interests, bio), and Usage Data (how you use our service, IP address, browser type).</p>
        </div>
        <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">3. How We Use Your Information</h3>
            <p>Your information is used to provide and improve our services, personalize your experience, communicate with you, ensure the security of our platform, and comply with legal obligations.</p>
        </div>
        <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">4. Information Sharing</h3>
            <p>We do not sell your personal information. We may share information with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law.</p>
        </div>
    </div>
  );

  const termsOfUseContent = (
    <div className="prose dark:prose-invert max-w-none space-y-6 text-foreground/80">
        <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">1. Acceptance of Terms</h3>
            <p>By accessing and using our service, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
        </div>
        <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">2. User Conduct</h3>
            <p>You agree not to use the service to post or transmit any material that is abusive, harassing, defamatory, vulgar, obscene, or is otherwise objectionable. You are responsible for all activities that occur under your account.</p>
        </div>
        <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">3. Intellectual Property</h3>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Sugar Connect and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Sugar Connect.</p>
        </div>
        <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">4. Termination</h3>
            <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not to a breach of the Terms.</p>
        </div>
    </div>
  );


  const renderPolicyDialog = (title: string, content: React.ReactNode) => (
      <Dialog>
        <DialogTrigger asChild>
          <button className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
            {title}
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary mb-3">{title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-6">
            {content}
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Accept & Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );

  return (
    <footer className="bg-white text-foreground dark:bg-[#22252a] py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo isScrolled={true} />
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            An exclusive platform for ambitious and attractive individuals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.label === 'Cookie Policy' ? (
                       renderPolicyDialog('Cookie Policy', cookiePolicyContent)
                    ) : link.label === 'Privacy Policy' ? (
                       renderPolicyDialog('Privacy Policy', privacyPolicyContent)
                    ) : link.label === 'Terms of Use' ? (
                       renderPolicyDialog('Terms of Use', termsOfUseContent)
                    ) : (
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Sugar Connect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
