"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Calendar,
  DollarSign,
  LogOut,
  Music,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Gallery", href: "/admin/gallery", icon: Image },
  { name: "Sponsors", href: "/admin/sponsors", icon: Users },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Donations", href: "/admin/donations", icon: DollarSign },
];

interface AdminSidebarProps {
  activePage: string;
}

export default function AdminSidebar({ activePage }: AdminSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--color-bg-card)] border-r border-white/5 p-6 hidden lg:block z-40">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white">Admin</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Amplify Ann Arbor
          </p>
        </div>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              activePage === item.name.toLowerCase().replace(" ", "")
                ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <Link href="/" target="_blank">
          <Button variant="ghost" className="w-full justify-start">
            View Site
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

