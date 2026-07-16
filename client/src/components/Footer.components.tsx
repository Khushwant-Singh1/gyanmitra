import { AspectRatio } from './ui/aspect-ratio';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FOLLOW_US_LINKS } from '@/constants/socialLinks.constants';
import { Link, NavLink } from 'react-router-dom';
import { buttonVariants } from './ui/button';
import content from '@/assets/content.json';
import { CSeparator } from './ui/customSeparator';
import { GET_HELP_LINKS } from '@/constants/links.constants';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-10">
      <div className="container mx-auto px-6">
        <div className="text-customGray grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="flex flex-col items-center text-center md:col-span-2 md:items-start md:text-left">
            {/* SEO Fix: Added title to home link */}
            <Link to="/" className="mb-4 block w-20" title="GyanMitra Home">
              <AspectRatio ratio={1 / 1}>
                <img
                  src={'/assets/gyanmitra.png'}
                  alt="GyanMitra Logo"
                  title="GyanMitra News - ताज़ा हिंदी समाचार" 
                  className="rounded-lg object-cover"
                />
              </AspectRatio>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-gray-600">
              {content.footerDescription}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="text-tertiary-foreground relative mb-4 pb-2 text-lg font-bold uppercase tracking-wider">
              Explore
              <CSeparator className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0" />
            </h3>
            <ul className="space-y-1">
              {GET_HELP_LINKS.length !== 0
                ? GET_HELP_LINKS.map((val) => (
                    <li key={val.link}>
                      <NavLink
                        to={val.link}
                        // SEO Fix: Added dynamic title
                        title={`Explore ${val.name}`}
                        className={({ isActive }) =>
                          `!px-0 text-base capitalize transition-all ${buttonVariants({
                            variant: 'link',
                          })} ${isActive ? 'font-bold text-secondary' : 'text-gray-600'}`
                        }
                      >
                        {val.name}
                      </NavLink>
                    </li>
                  ))
                : 'No data'}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-10">
          <div className="flex flex-col items-center justify-between space-y-8 md:flex-row md:space-y-0">
            {/* Social Links Section */}
            <div className="flex flex-col items-center space-y-4 md:items-start">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
                Follow Us On
              </h3>
              <div className="flex gap-3">
                {FOLLOW_US_LINKS.map((link) => {
                  // TypeScript Error Fix: Extracting platform from URL to avoid 'link.name' error
                  const platform = link.url.includes('facebook') ? 'Facebook' : 
                                   link.url.includes('instagram') ? 'Instagram' : 
                                   link.url.includes('twitter') ? 'Twitter' : 
                                   link.url.includes('youtube') ? 'YouTube' : 'Social Media';

                  return (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      // SEO Fix: Added Title and Aria-label
                      title={`Follow us on ${platform}`}
                      aria-label={`Follow us on ${platform}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-transform active:scale-90 hover:bg-zinc-50"
                    >
                      <FontAwesomeIcon icon={link.icon} className="text-gray-700" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Legal & Copyright Section */}
            <div className="flex flex-col items-center space-y-3 text-center md:items-end md:text-right">
              <Link
                to="/privacy-policy"
                title="Privacy Policy and Terms of Use"
                className="text-sm font-medium text-gray-600 hover:text-secondary"
              >
                Privacy Policy & Terms
              </Link>
              
              <div className="space-y-1 text-[13px] text-gray-500">
                <p>© {new Date().getFullYear()} All Rights Reserved</p>
                <p>
                  Developed by{' '}
                  <a
                    href="https://www.tecxontech.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Tecxon Technology IT Solutions Company"
                    className="font-bold text-gray-800 transition-colors hover:text-secondary"
                  >
                    Tecxon Technology
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-20 md:hidden" />
      </div>
    </footer>
  );
}