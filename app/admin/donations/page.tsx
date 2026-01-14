"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  Download,
  Search,
  TrendingUp,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Donation {
  id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  message: string | null;
  event_name: string | null;
  created_at: string;
}

export default function AdminDonationsPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    checkAuth();
    fetchDonations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const fetchDonations = async () => {
    setIsLoading(true);
    
    // Placeholder data
    setDonations([
      {
        id: "1",
        donor_name: "John Smith",
        donor_email: "john@example.com",
        amount: 100,
        message: "Great cause! Happy to support.",
        event_name: "Amplify Ann Arbor 2026",
        created_at: "2026-01-14T10:30:00Z",
      },
      {
        id: "2",
        donor_name: "Jane Doe",
        donor_email: "jane@example.com",
        amount: 50,
        message: null,
        event_name: "Amplify Ann Arbor 2026",
        created_at: "2026-01-13T15:45:00Z",
      },
      {
        id: "3",
        donor_name: "Anonymous",
        donor_email: "anon@example.com",
        amount: 250,
        message: "For the seniors!",
        event_name: "Amplify Ann Arbor 2026",
        created_at: "2026-01-12T09:00:00Z",
      },
      {
        id: "4",
        donor_name: "Michael Johnson",
        donor_email: "michael@example.com",
        amount: 75,
        message: null,
        event_name: "Amplify Ann Arbor 2026",
        created_at: "2026-01-11T14:20:00Z",
      },
      {
        id: "5",
        donor_name: "Sarah Williams",
        donor_email: "sarah@example.com",
        amount: 500,
        message: "Love what you're doing for the community.",
        event_name: null,
        created_at: "2026-01-10T11:00:00Z",
      },
    ]);
    
    setIsLoading(false);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Name", "Email", "Amount", "Message", "Event"];
    const rows = donations.map(d => [
      formatDate(d.created_at),
      d.donor_name,
      d.donor_email,
      d.amount.toString(),
      d.message || "",
      d.event_name || "",
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDonations = donations.filter(d =>
    d.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.donor_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const averageDonation = donations.length > 0 ? totalDonations / donations.length : 0;
  
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  const totalPages = Math.ceil(filteredDonations.length / perPage);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="donations" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Donations</h1>
            <p className="text-[var(--color-text-secondary)]">
              Track and manage donations
            </p>
          </div>
          <Button variant="secondary" onClick={exportToCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[var(--color-success)]" />
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-sm">Total Raised</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(totalDonations)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-sm">Total Donors</p>
                  <p className="text-2xl font-bold text-white">{donations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[var(--color-gold)]" />
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-sm">Average</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(averageDonation)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Donations Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-text-secondary)]">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-text-secondary)]">
                    Donor
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-text-secondary)]">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-text-secondary)]">
                    Message
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-text-secondary)]">
                    Event
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDonations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="border-b border-white/5 hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(donation.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{donation.donor_name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {donation.donor_email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[var(--color-success)] font-bold">
                        {formatCurrency(donation.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-[var(--color-text-secondary)] truncate">
                        {donation.message || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {donation.event_name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredDonations.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">
                {searchQuery ? "No donations found" : "No donations yet"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <p className="text-sm text-[var(--color-text-muted)]">
                Showing {(currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, filteredDonations.length)} of{" "}
                {filteredDonations.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

