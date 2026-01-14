import { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photo gallery from past Amplify Ann Arbor events. Relive the memories and see the community impact.",
};

export const runtime = "edge";
export const revalidate = 3600; // Revalidate every hour

async function getGalleryImages() {
  const { data, error } = await supabase
    .from("photo_gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }

  return data || [];
}

export default async function GalleryPage() {
  const galleryImages = await getGalleryImages();

  const events = [
    { id: "all", name: "All Events" },
    { id: "2025", name: "Amplify Ann Arbor 2025" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="section pt-24 md:pt-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
              <Camera className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-accent)]">
                Event Memories
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Photo</span>{" "}
              <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Relive the energy and community spirit from our past events.
              Every photo tells a story of support and solidarity.
            </p>
          </div>

          {/* Gallery Grid with Lightbox */}
          {galleryImages.length > 0 ? (
            <GalleryGrid images={galleryImages} events={events} />
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-[var(--color-text-muted)]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                No Photos Yet
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                Check back after our next event to see photos from the concert!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
