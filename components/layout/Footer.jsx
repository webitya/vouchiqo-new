import Image from "next/image";
import Link from "next/link";

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedInIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const MediumIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const BloggerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.96 3H4.04A2.04 2.04 0 002 5.04v13.92A2.04 2.04 0 004.04 21h15.92A2.04 2.04 0 0022 18.96V5.04A2.04 2.04 0 0019.96 3zM15 9.5a1.5 1.5 0 01-1.5 1.5H9.5A1.5 1.5 0 018 9.5v-1A1.5 1.5 0 019.5 7h4A1.5 1.5 0 0115 8.5v1zm1 6a1.5 1.5 0 01-1.5 1.5H9.5A1.5 1.5 0 018 15.5v-1A1.5 1.5 0 019.5 13h5A1.5 1.5 0 0116 14.5v1z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="w-full bg-[#0b0f19] text-slate-400 pt-12 pb-6 border-t border-slate-800/80 mt-auto select-none text-left font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10 mb-10">
          {/* Brand Info Block */}
          <div className="col-span-2 lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <Link
              href="/"
              className="inline-block bg-white p-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Image
                src="/navbarlogovouchiqo.webp"
                alt="Vouchiqo Logo"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Striving towards making the world a better place to shop with
              great savings. We help you turn verified promotional offers into
              instant value.
            </p>
            {/* Social Icons */}
            <div className="flex gap-2.5 pt-1.5">
              <a
                href="https://www.instagram.com/vouchiqo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#E1306C] flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xs"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/vouchiqo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#0077B5] flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xs"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a
                href="https://medium.com/@lokesh.vouchiqo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xs"
                aria-label="Medium"
              >
                <MediumIcon className="w-4 h-4" />
              </a>
              <a
                href="https://vouchiqo.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#F57D00] flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xs"
                aria-label="Blogger"
              >
                <BloggerIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/categories"
                >
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/brands"
                >
                  Partner Brands
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/nearby-offers"
                >
                  Nearby Offers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/expired-coupon-revival"
                >
                  Offer Revival
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/faq"
                >
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Accounts & Portal */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">
              Accounts
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/login"
                >
                  User Login
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/register"
                >
                  User Register
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/merchant-login"
                >
                  Merchant Login
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/merchant-register"
                >
                  Merchant Register
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/admin-login"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/terms"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/contact"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center">
                <a
                  className="hover:text-white transition-colors"
                  href="mailto:contact@vouchiqo.com"
                >
                  contact@vouchiqo.com
                </a>
              </li>
              <li className="flex items-center">
                <span>+91-7997443334</span>
              </li>
              <li className="flex items-start">
                <span className="leading-relaxed">
                  Ranchi, Jharkhand, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Block */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
            <span>&copy; {new Date().getFullYear()} Vouchiqo. All Rights Reserved.</span>
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Designed & Maintained by{" "}
            <a
              href="https://webitya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 font-semibold transition-colors"
            >
              Webitya
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
