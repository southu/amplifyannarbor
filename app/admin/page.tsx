"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Image,
  FileText,
  Calendar,
  LogOut,
  ArrowRight,
  TrendingUp,
  Ticket,
} from "lucide-react";

interface DashboardStats {
  totalDonations: number;
  donationCount: number;
  ticketCount: number;
  sponsorCount: number;
  blogPostCount: number;
  galleryCount: number;
}

interface RecentDonation {
  id: string;
  donor_name: string;
  amount: number;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    donationCount: 0,
    ticketCount: 0,
    sponsorCount: 0,
    blogPostCount: 0,
    galleryCount: 0,
  });
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      // These queries would work once Supabase tables are set up
      // For now, we'll use placeholder data

      // Fetch recent donations
      // const { data: donations } = await supabase
      //   .from("donations")
      //   .select("*")
      //   .order("created_at", { ascending: false })
      //   .limit(5);

      // Placeholder data
      setStats({
        totalDonations: 12500,
        donationCount: 47,
        ticketCount: 125,
        sponsorCount: 11,
        blogPostCount: 4,
        galleryCount: 24,
      });

      setRecentDonations([
        {
          id: "1",
          donor_name: "John Smith",
          amount: 100,
          created_at: "2026-01-14T10:30:00Z",
        },
        {
          id: "2",
          donor_name: "Jane Doe",
          amount: 50,
          created_at: "2026-01-13T15:45:00Z",
        },
        {
          id: "3",
          donor_name: "Anonymous",
          amount: 250,
          created_at: "2026-01-12T09:00:00Z",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const statCards = [
    {
      title: "Total Donations",
      value: formatCurrency(stats.totalDonations),
      icon: DollarSign,
      color: "var(--color-success)",
      href: "/admin/donations",
    },
    {
      title: "Donors",
      value: stats.donationCount.toString(),
      icon: Users,
      color: "var(--color-accent)",
      href: "/admin/donations",
    },
    {
      title: "Tickets Sold",
      value: stats.ticketCount.toString(),
      icon: Ticket,
      color: "var(--color-gold)",
      href: "/admin/events",
    },
    {
      title: "Sponsors",
      value: stats.sponsorCount.toString(),
      icon: TrendingUp,
      color: "var(--color-accent-light)",
      href: "/admin/sponsors",
    },
  ];

  const quickActions = [
    { label: "New Blog Post", icon: FileText, href: "/admin/blog/new" },
    { label: "Upload Photos", icon: Image, href: "/admin/gallery" },
    { label: "Manage Sponsors", icon: Users, href: "/admin/sponsors" },
    { label: "View Events", icon: Calendar, href: "/admin/events" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--color-bg-card)] border-r border-white/5 p-6 hidden lg:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">Admin</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Amplify Ann Arbor
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-colors"
          >
            <FileText className="w-5 h-5" />
            Blog Posts
          </Link>
          <Link
            href="/admin/gallery"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-colors"
          >
            <Image className="w-5 h-5" />
            Gallery
          </Link>
          <Link
            href="/admin/sponsors"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-colors"
          >
            <Users className="w-5 h-5" />
            Sponsors
          </Link>
          <Link
            href="/admin/events"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Events
          </Link>
          <Link
            href="/admin/donations"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Donations
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
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

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-[var(--color-text-secondary)]">
              Welcome back! Here&apos;s what&apos;s happening.
            </p>
          </div>
          <Link href="/" target="_blank">
            <Button variant="secondary" size="sm">
              View Site
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[var(--color-text-secondary)] text-sm mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.icon
                        className="w-5 h-5"
                        style={{ color: stat.color }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Donations */}
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">
                  Recent Donations
                </h2>
                <Link
                  href="/admin/donations"
                  className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-light)]"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 bg-[var(--color-bg-elevated)] rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {donation.donor_name}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {formatDate(donation.created_at)}
                      </p>
                    </div>
                    <span className="text-[var(--color-success)] font-bold">
                      {formatCurrency(donation.amount)}
                    </span>
                  </div>
                ))}

                {recentDonations.length === 0 && (
                  <p className="text-[var(--color-text-muted)] text-center py-8">
                    No donations yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-lg font-bold text-white mb-6">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href}>
                    <Card className="p-4 hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer">
                      <CardContent className="p-0 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                          <action.icon className="w-5 h-5 text-[var(--color-accent)]" />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {action.label}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

