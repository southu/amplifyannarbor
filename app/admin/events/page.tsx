"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  DollarSign,
  X,
  Save,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  ticket_price: number | null;
  status: "draft" | "published" | "archived";
  tickets_sold: number;
  total_revenue: number;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchEvents();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    
    // Placeholder data
    setEvents([
      {
        id: "1",
        title: "Amplify Ann Arbor 2026",
        date: "2026-07-30",
        time: "18:30",
        location: "The Blind Pig, Ann Arbor",
        description: "Annual charity concert benefiting Ann Arbor Meals on Wheels.",
        ticket_price: null,
        status: "published",
        tickets_sold: 125,
        total_revenue: 8750,
      },
      {
        id: "2",
        title: "Amplify Ann Arbor 2025",
        date: "2025-07-30",
        time: "18:30",
        location: "The Blind Pig, Ann Arbor",
        description: "Last year's successful benefit concert.",
        ticket_price: null,
        status: "archived",
        tickets_sold: 200,
        total_revenue: 12500,
      },
    ]);
    
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setEvents(events.filter(e => e.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
      case "draft":
        return "bg-[var(--color-warning)]/10 text-[var(--color-warning)]";
      case "archived":
        return "bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)]";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="events" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Events</h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage your events
            </p>
          </div>
          <Button variant="default" onClick={() => setIsAddingNew(true)}>
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id} className="p-6">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white">
                        {event.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <p className="text-[var(--color-text-secondary)] mb-4">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--color-accent)]" />
                        {event.location}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap lg:flex-nowrap gap-4">
                    <div className="bg-[var(--color-bg-elevated)] rounded-lg p-4 min-w-[120px]">
                      <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-1">
                        <Ticket className="w-4 h-4" />
                        <span className="text-xs">Tickets</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {event.tickets_sold}
                      </p>
                    </div>
                    <div className="bg-[var(--color-bg-elevated)] rounded-lg p-4 min-w-[120px]">
                      <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs">Revenue</span>
                      </div>
                      <p className="text-xl font-bold text-[var(--color-success)]">
                        {formatCurrency(event.total_revenue)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingEvent(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
                      className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {events.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] mb-4">
              No events created yet
            </p>
            <Button variant="default" onClick={() => setIsAddingNew(true)}>
              <Plus className="w-4 h-4" />
              Create Your First Event
            </Button>
          </div>
        )}

        {/* Add/Edit Modal would go here */}
        {(isAddingNew || editingEvent) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {editingEvent ? "Edit Event" : "New Event"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingEvent(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form className="space-y-4">
                  <Input
                    label="Event Title"
                    defaultValue={editingEvent?.title || ""}
                    placeholder="Amplify Ann Arbor 2026"
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Date"
                      type="date"
                      defaultValue={editingEvent?.date || ""}
                    />
                    <Input
                      label="Time"
                      type="time"
                      defaultValue={editingEvent?.time || ""}
                    />
                  </div>

                  <Input
                    label="Location"
                    defaultValue={editingEvent?.location || ""}
                    placeholder="The Blind Pig, Ann Arbor"
                  />

                  <Textarea
                    label="Description"
                    defaultValue={editingEvent?.description || ""}
                    placeholder="Event description..."
                  />

                  <Input
                    label="Ticket Price (leave empty for donation-based)"
                    type="number"
                    step="0.01"
                    defaultValue={editingEvent?.ticket_price?.toString() || ""}
                    placeholder="0.00"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Status
                    </label>
                    <div className="flex gap-2">
                      {["draft", "published", "archived"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            (editingEvent?.status || "draft") === status
                              ? "bg-[var(--color-accent)] text-white"
                              : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingEvent(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="default">
                      <Save className="w-4 h-4" />
                      {editingEvent ? "Save Changes" : "Create Event"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

