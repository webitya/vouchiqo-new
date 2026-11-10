import Image from "next/image";
import Link from "next/link";

const LOGO = {
  src: "/navbarlogovouchiqo.webp",
  alt: "Vouchiqo",
  href: "/",
};

export const Logo = () => (
  <Link href={LOGO.href} prefetch={true} className="shrink-0 flex items-center">
    <Image
      src={LOGO.src}
      alt={LOGO.alt}
      width={160}
      height={48}
      priority
      className="h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 w-auto object-contain transition-all"
    />
  </Link>
);

export default Logo;
