
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Only show consent if not already accepted
    if (!localStorage.getItem('cookie_consent')) {
      setShowConsent(true);
    }
  }, []);

  const acceptConsent = () => {
    setShowConsent(false);
    localStorage.setItem('cookie_consent', 'true');
  };

  if (!showConsent) {
    return null;
  }
  
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-4 z-50 border-t">
       <Dialog>
        <div className="container mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex-1">
            To enhance your browsing experience and ensure our platform works effectively, we use cookies and other similar technologies to analyze site traffic and personalize content. By clicking "Accept and Close", you consent to our use of these technologies. You can learn more about how we use cookies and manage your preferences by reading our {' '}
            <DialogTrigger asChild>
                 <button className="underline text-primary">Cookie Policy</button>
            </DialogTrigger>.
          </p>
          <div className="flex-shrink-0">
             <Button onClick={acceptConsent} size="sm">Accept and Close</Button>
          </div>
        </div>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-primary mb-3">Cookie Policy</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-6">
            {cookiePolicyContent}
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={acceptConsent}>Accept & Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
