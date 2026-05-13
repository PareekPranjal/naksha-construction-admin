"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { RESOURCES } from "@/lib/resources";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Image as ImageIcon,
  ArrowRightLeft,
  Inbox,
  Package,
  Menu,
  Sliders,
  Search,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function Sidebar() {
  const pathname = usePathname();

  const collections: NavItem[] = Object.values(RESOURCES).map((r) => ({
    href: `/${r.key}`,
    label: r.label,
    icon: Package,
  }));

  const sections: { heading: string; items: NavItem[] }[] = [
    { heading: "", items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }] },
    { heading: "Content", items: collections },
    {
      heading: "Site",
      items: [
        { href: "/pages", label: "Pages", icon: FileText },
        { href: "/navigation", label: "Navigation", icon: Menu },
        { href: "/settings", label: "Site settings", icon: Sliders },
        { href: "/seo", label: "SEO", icon: Search },
        { href: "/site", label: "Globals (raw JSON)", icon: Settings },
        { href: "/media", label: "Media library", icon: ImageIcon },
        { href: "/redirects", label: "Redirects", icon: ArrowRightLeft },
        { href: "/contact", label: "Contact inbox", icon: Inbox },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-rule bg-white py-8 px-4">
      <Link href="/" className="block px-3 mb-8">
        <p className="font-semibold text-lg tracking-tight">Naksha</p>
        <p className="text-xs text-muted">Admin</p>
      </Link>
      <nav className="space-y-6">
        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <p className="px-3 text-[11px] uppercase tracking-wider text-muted mb-2">
                {section.heading}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-ink text-paper"
                          : "text-ink/80 hover:bg-rule/40",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
