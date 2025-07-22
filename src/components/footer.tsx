
import Link from 'next/link';
import { Logo } from './logo';

export function Footer() {
  const footerSections = [
    {
      title: 'Site',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'FAQs', href: '#' },
        { label: 'Glossary', href: '#' },
      ],
    },
    {
      title: 'Policies',
      links: [
        { label: 'Cookie Policy', href: '/cookie-policy' },
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
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                      {link.label}
                    </Link>
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
