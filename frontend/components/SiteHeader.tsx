'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaCartShopping, FaWhatsapp } from 'react-icons/fa6';
import { WHATSAPP_NUMBER } from '../lib/api';
import { useCart } from '../lib/cart';
import { useLocale } from '../lib/i18n/context';
import { PreferencesToggle } from './PreferencesToggle';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const { t } = useLocale();

  const LINKS = [
    { href: '/', label: t.header.nav.home },
    { href: '/produits', label: t.header.nav.products },
    { href: '/boutiques', label: t.header.nav.boutiques },
    { href: '/actualites', label: t.header.nav.news },
    { href: '/contact', label: t.header.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-navy to-slate-700 text-sm font-bold text-white shadow-[0_6px_14px_-4px_rgba(15,23,42,0.45)]">
            A
          </span>
          <span className="truncate text-base font-bold text-navy sm:text-lg">Amza Futur Telecom</span>
        </Link>

        <nav className="hidden flex-1 justify-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-navy">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2">
          <PreferencesToggle className="hidden sm:flex" />
          <Link
            href="/panier"
            aria-label={t.header.cart}
            className="relative flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-slate-200 text-navy hover:bg-slate-50"
          >
            <FaCartShopping aria-hidden size={16} />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <FaWhatsapp aria-hidden size={16} />
            <span className="hidden sm:inline">{t.header.whatsapp}</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-slate-200 text-navy lg:hidden"
          >
            <span aria-hidden className="text-lg leading-none">
              {open ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-navy"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-slate-100 pt-3 sm:hidden">
            <PreferencesToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
