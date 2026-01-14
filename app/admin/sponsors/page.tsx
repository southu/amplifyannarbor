"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit,
  Trash2,
  Crown,
  Users,
  GripVertical,
  X,
  Save,
  ExternalLink,
} from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  tier: "title" | "supporting";
  logo_url: string;
  description: string | null;
  website_url: string | null;
  display_order: number;
}

export default function AdminSponsorsPage() {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSponsor, setNewSponsor] = useState<Partial<Sponsor>>({
    name: "",
    tier: "supporting",
    description: "",
    website_url: "",
  });

  useEffect(() => {
    checkAuth();
    fetchSponsors();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const fetchSponsors = async () => {
    setIsLoading(true);
    
    // Placeholder data
    setSponsors([
      {
        id: "1",
        name: "Ready Signal",
        tier: "title",
        logo_url: "/sponsors/ready-signal.png",
        description: "AI-powered external data enrichment and forecasting.",
        website_url: "https://readysignal.com",
        display_order: 1,
      },
      {
        id: "2",
        name: "Goldman Sachs",
        tier: "supporting",
        logo_url: "/sponsors/goldman-sachs.png",
        description: "A global leader in investment banking.",
        website_url: "https://goldmansachs.com",
        display_order: 2,
      },
      {
        id: "3",
        name: "Image Group",
        tier: "supporting",
        logo_url: "/sponsors/image-group.png",
        description: "Branding and promotional products agency.",
        website_url: "https://imagegroup.com",
        display_order: 3,
      },
    ]);
    
    setIsLoading(false);
  };

  const handleSave = async (sponsor: Sponsor) => {
    // Would save to Supabase
    setSponsors(sponsors.map(s => s.id === sponsor.id ? sponsor : s));
    setEditingSponsor(null);
  };

  const handleAddNew = async () => {
    // Would add to Supabase
    const sponsor: Sponsor = {
      id: Date.now().toString(),
      name: newSponsor.name || "New Sponsor",
      tier: newSponsor.tier as "title" | "supporting" || "supporting",
      logo_url: "",
      description: newSponsor.description || null,
      website_url: newSponsor.website_url || null,
      display_order: sponsors.length + 1,
    };
    
    setSponsors([...sponsors, sponsor]);
    setIsAddingNew(false);
    setNewSponsor({
      name: "",
      tier: "supporting",
      description: "",
      website_url: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this sponsor?")) return;
    setSponsors(sponsors.filter(s => s.id !== id));
  };

  const titleSponsors = sponsors.filter(s => s.tier === "title");
  const supportingSponsors = sponsors.filter(s => s.tier === "supporting");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="sponsors" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Sponsors</h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage event sponsors
            </p>
          </div>
          <Button variant="default" onClick={() => setIsAddingNew(true)}>
            <Plus className="w-4 h-4" />
            Add Sponsor
          </Button>
        </div>

        {/* Add New Form */}
        {isAddingNew && (
          <Card className="p-6 mb-8">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Add New Sponsor</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsAddingNew(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Sponsor Name"
                  value={newSponsor.name}
                  onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                  placeholder="Company Name"
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Tier
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewSponsor({ ...newSponsor, tier: "title" })}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
                        newSponsor.tier === "title"
                          ? "bg-[var(--color-gold)] text-[var(--color-bg-dark)]"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                      )}
                    >
                      <Crown className="w-4 h-4 inline mr-2" />
                      Title
                    </button>
                    <button
                      onClick={() => setNewSponsor({ ...newSponsor, tier: "supporting" })}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
                        newSponsor.tier === "supporting"
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                      )}
                    >
                      <Users className="w-4 h-4 inline mr-2" />
                      Supporting
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Website URL"
                  value={newSponsor.website_url || ""}
                  onChange={(e) => setNewSponsor({ ...newSponsor, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-[var(--color-text-secondary)]"
                  />
                </div>
              </div>
              <Textarea
                label="Description"
                value={newSponsor.description || ""}
                onChange={(e) => setNewSponsor({ ...newSponsor, description: e.target.value })}
                placeholder="Brief description of the sponsor..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setIsAddingNew(false)}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleAddNew}>
                  <Save className="w-4 h-4" />
                  Add Sponsor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Title Sponsors */}
        {titleSponsors.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-[var(--color-gold)]" />
              <h2 className="text-xl font-bold text-white">Title Sponsor</h2>
            </div>
            <div className="space-y-4">
              {titleSponsors.map((sponsor) => (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  onEdit={() => setEditingSponsor(sponsor)}
                  onDelete={() => handleDelete(sponsor.id)}
                  isEditing={editingSponsor?.id === sponsor.id}
                  onSave={handleSave}
                  onCancel={() => setEditingSponsor(null)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Supporting Sponsors */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="text-xl font-bold text-white">Supporting Sponsors</h2>
          </div>
          <div className="space-y-4">
            {supportingSponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                sponsor={sponsor}
                onEdit={() => setEditingSponsor(sponsor)}
                onDelete={() => handleDelete(sponsor.id)}
                isEditing={editingSponsor?.id === sponsor.id}
                onSave={handleSave}
                onCancel={() => setEditingSponsor(null)}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {sponsors.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] mb-4">
              No sponsors added yet
            </p>
            <Button variant="default" onClick={() => setIsAddingNew(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Sponsor
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

interface SponsorCardProps {
  sponsor: Sponsor;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  onSave: (sponsor: Sponsor) => void;
  onCancel: () => void;
}

function SponsorCard({
  sponsor,
  onEdit,
  onDelete,
  isEditing,
  onSave,
  onCancel,
}: SponsorCardProps) {
  const [editedSponsor, setEditedSponsor] = useState(sponsor);

  if (isEditing) {
    return (
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Name"
              value={editedSponsor.name}
              onChange={(e) => setEditedSponsor({ ...editedSponsor, name: e.target.value })}
            />
            <Input
              label="Website"
              value={editedSponsor.website_url || ""}
              onChange={(e) => setEditedSponsor({ ...editedSponsor, website_url: e.target.value })}
            />
          </div>
          <Textarea
            label="Description"
            value={editedSponsor.description || ""}
            onChange={(e) => setEditedSponsor({ ...editedSponsor, description: e.target.value })}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="default" onClick={() => onSave(editedSponsor)}>
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <div className="flex items-start gap-4">
          <div className="w-6 text-[var(--color-text-muted)] cursor-grab">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="w-16 h-16 bg-[var(--color-bg-elevated)] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-[var(--color-accent)]">
              {sponsor.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white">{sponsor.name}</h3>
            <p className="text-[var(--color-text-secondary)] text-sm line-clamp-2">
              {sponsor.description || "No description"}
            </p>
            {sponsor.website_url && (
              <a
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] mt-1"
              >
                {sponsor.website_url}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

