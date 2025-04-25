"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Bell, ChevronRight } from "lucide-react";
import UserProfile from "./user-profile";
import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { useAuth } from "../auth/auth-provider";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function TopNav() {
  const { user } = useAuth();

  const pathname = usePathname();

  // Map route segments to user-friendly names
  const routeSegmentMap = {
    dashboard: "Dashboard",
    prices: "Price Management",
    "add-price": "Add Price",
    "edit-price": "Edit Price",
    markets: "Markets",
    "add-market": "Add Market",
    "edit-market": "Edit Market",
    "market-comparison": "Market Comparison",
    "price-trends": "Price Trends",
    profile: "Profile Settings",
  };

  // Parse pathname to create breadcrumbs
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      // Handle dynamic routes like [id]
      if (segment.includes("[") || segment.match(/^[0-9a-fA-F]{24}$/)) {
        return { label: "Details", href: "#" };
      }
      return {
        label:
          routeSegmentMap[segment as keyof typeof routeSegmentMap] ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
        href: `/${segment}`,
      };
    });

  // Always include the home segment
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "ClyCites", href: "/dashboard" },
    ...segments,
  ];

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <button
          title="Notifications"
          type="button"
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <ThemeToggle />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user?.name}
                </span>
                <Image
                  src="/placeholder.svg?height=28&width=28"
                  alt="User avatar"
                  width={28}
                  height={28}
                  className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
            >
              <UserProfile />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
