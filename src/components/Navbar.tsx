"use client";
import { useState } from "react";
import Link from "next/link";

// NAV LINKS — add/remove entries here to update both desktop and mobile menus
const navLinks = [
  { label: "About",   href: "/about"   },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="p-4 mx-4 mt-4 bg-Primary/90 rounded-2xl border-2 border-Accent text-Text">
      <div className="flex justify-between items-center">

        {/* Desktop navbar */}
        <ul className="hidden navbar:flex gap-10 text-lg items-center">
          <li>
            {/*
              Replace the text below with your logo image:
              <Link href="/"><img src="/logo.png" alt="Logo" className="h-12" /></Link>
            */}
            <Link href="/" className="text-xl font-bold text-Accent hover-glitch">
              YourBrand
            </Link>
          </li>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover-glitch">{link.label}</Link>
            </li>
          ))}
        </ul>

        {/* Mobile: hamburger + brand name */}
        <div className="flex navbar:hidden items-center gap-3">
          <button onClick={() => setIsOpen(true)} className="text-Accent text-3xl">
            ☰
          </button>
          <Link href="/" className="text-lg font-bold text-Accent">
            YourBrand
          </Link>
        </div>

        {/* CTA button — always visible */}
        <Link
          href="#cta"
          className="hover-glitch font-bold bg-Accent text-Primary px-4 py-2 rounded-lg hover:opacity-80 transition-all"
        >
          Get Started
        </Link>
      </div>

      {/* Fullscreen mobile menu */}
      <div
        className={`fixed inset-0 bg-Primary z-50 flex flex-col items-center justify-center gap-8 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-8 left-8 text-Accent text-4xl"
        >
          ✕
        </button>

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-4xl hover-glitch"
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="#cta"
          className="font-bold bg-Accent text-Primary px-4 py-2 rounded-lg hover:opacity-80 transition-all"
          onClick={() => setIsOpen(false)}
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
};
