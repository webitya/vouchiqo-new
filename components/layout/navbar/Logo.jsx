import Image from "next/image";
import Link from "next/link";

const LOGO = {
  src: "/navbarlogovouchiqo.webp",
  alt: "Vouchiqo",
  href: "/",
};

export const Logo = () => (
  <Link href={LOGO.href} prefetch={true} className="shrink-0 flex items-center">
    <div className="bg-white/95 hover:bg-white px-2 py-0.5 rounded-lg transition-all shadow-xs border border-white/20 flex items-center">
      <Image
        src={LOGO.src}
        alt={LOGO.alt}
        width={160}
        height={48}
        priority
        className="h-7 sm:h-8 md:h-8.5 xl:h-9 w-auto object-contain transition-all"
      />
    </div>
  </Link>
);

export default Logo;
