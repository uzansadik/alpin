"use client";

import { cn } from "@upkick/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SettingsNavProps = {
  isOwner: boolean;
};

const items = [
  {
    title: "General",
    href: "/settings",
  },
  {
    title: "Members",
    href: "/settings/members",
  },
  {
    title: "Profile",
    href: "/settings/profile",
  },
];

export function SettingsNav({ isOwner }: SettingsNavProps) {
  const pathname = usePathname();

  const navigationItems = isOwner
    ? [
        ...items,
        {
          title: "Billing",
          href: "/settings/billing",
        },
      ]
    : items;

  return (
    <nav className="flex gap-4">
      {navigationItems.map((item) => {
        const active =
          item.href === "/settings" ? pathname === "/settings" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              active && "text-foreground",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
