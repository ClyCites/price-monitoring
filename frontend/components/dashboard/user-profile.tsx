"use client"

import type React from "react"

import { LogOut, MoveUpRight, Settings, User, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/context/auth-context"
import { useLogout } from "@/lib/hooks/use-auth"

interface MenuItem {
  label: string
  value?: string
  href: string
  icon?: React.ReactNode
  external?: boolean
}

export default function UserProfile() {
  const { user } = useAuth()
  const { mutate: logout, isPending } = useLogout()

  const menuItems: MenuItem[] = [
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="w-4 h-4" />,
      external: false,
    },
    {
      label: "Settings",
      href: "/profile",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="w-4 h-4" />,
      external: true,
    },
  ]

  if (!user) {
    return null
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative shrink-0">
              <Image
                src="/placeholder.svg?height=72&width=72"
                alt={user.name}
                width={72}
                height={72}
                className="rounded-full ring-4 ring-white dark:ring-zinc-900 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</h2>
              <p className="text-zinc-600 dark:text-zinc-400">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {user.role === "admin" ? "Administrator" : "User"}
              </span>
            </div>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-6" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2 
                                hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                                rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                </div>
                <div className="flex items-center">
                  {item.value && <span className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">{item.value}</span>}
                  {item.external && <MoveUpRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => logout()}
              disabled={isPending}
              className="w-full flex items-center justify-between p-2 
                            hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                            rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {isPending ? "Logging out..." : "Logout"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

