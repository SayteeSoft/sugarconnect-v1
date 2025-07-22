
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 z-50">
      <div className="container mx-auto flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">
          We use cookies to enhance your experience and analyze site traffic. By clicking &quot;Accept&quot;, you agree to our use of cookies. You can learn more by reading our {' '}
          <Link href="/cookie-policy" className="underline text-primary">
            Cookie Policy
          </Link>.
        </p>
        <Button onClick={acceptConsent} size="sm">Accept</Button>
      </div>
    </div>
  );
}
