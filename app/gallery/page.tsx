import { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Camera, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photo gallery from past Amplify Ann Arbor events. Relive the memories and see the community impact.",
};

// Sample gallery data - will be replaced with Supabase data
const galleryImages = [
  {
    id: "1",
    image_url: "/gallery/event-1.jpg",
    caption: "N*D performing at the 2025 benefit concert",
    photographer: "Local Photographer",
    event_id: "1",
    event_name: "Amplify Ann Arbor 2025",
    upload_date: "2025-08-01",
  },
  {
    id: "2",
    image_url: "/gallery/event-2.jpg",
    caption: "Crowd enjoying the show at The Blind Pig",
    photographer: null,
    event_id: "1",
    event_name: "Amplify Ann Arbor 2025",
    upload_date: "2025-08-01",
  },
  {
    id: "3",
    image_url: "/gallery/event-3.jpg",
    caption: "Jimmy Was Busy opening set",
    photographer: "Local Photographer",
    event_id: "1",
    event_name: "Amplify Ann Arbor 2025",
    upload_date: "2025-08-01",
  },
  {
    id: "4",
    image_url: "/gallery/event-4.jpg",
    caption: "Sponsors and organizers at the event",
    photographer: null,
    event_id: "1",
    event_name: "Amplify Ann Arbor 2025",
    upload_date: "2025-08-01",
  },
  {
    id: "5",
    image_url: "/gallery/event-5.jpg",
    caption: "The venue packed with supporters",
    photographer: "Local Photographer",
    event_id: "1",
    event_name: "Amplify Ann Arbor 2025",
    upload_date: "2025-08-01",
  },
  {
    id: "6",
    image_url: "/gallery/event-6.jpg",
    caption: "Donations being collected at the door",
    photographer: null,
    event_id: "1",
    event_name: "Amplify Ann Arbor 2025",
    upload_date: "2025-08-01",
  },
];

const events = [
  { id: "all", name: "All Events" },
  { id: "1", name: "Amplify Ann Arbor 2025" },
];

export default function GalleryPage() {
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
          <GalleryGrid images={galleryImages} events={events} />
        </div>
      </section>

      {/* Empty State for No Photos */}
      {galleryImages.length === 0 && (
        <section className="section pt-0">
          <div className="container">
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
          </div>
        </section>
      )}
    </>
  );
}

