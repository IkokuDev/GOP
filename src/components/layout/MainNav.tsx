"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type MainNavProps = {
  isMobile?: boolean;
};

export function MainNav({ isMobile = false }: MainNavProps) {
  const pathname = usePathname();
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/quizzes", label: "Quizzes" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-foreground/80",
        pathname === href ? "text-foreground" : "text-foreground/60",
        isMobile && "text-lg py-2"
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className={cn(
      "flex items-center gap-4 text-sm lg:gap-6",
      isMobile && "flex-col items-start gap-4"
    )}>
      {navLinks.map((link) => (
        <NavLink key={link.href} {...link} />
      ))}
    </nav>
  );
}
