"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { cn } from "@/lib/utils";
import { Camera, Calendar, User } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  photographer: string | null;
  event_id: string | null;
  event_name?: string;
  upload_date: string;
}

interface GalleryEvent {
  id: string;
  name: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  events: GalleryEvent[];
}

export function GalleryGrid({ images, events }: GalleryGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState("all");

  const filteredImages =
    selectedEvent === "all"
      ? images
      : images.filter((img) => img.event_id === selectedEvent);

  const lightboxSlides = filteredImages.map((img) => ({
    src: img.image_url,
    alt: img.caption || "Gallery image",
    title: img.caption || undefined,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* Event Filter */}
      {events.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                selectedEvent === event.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-white"
              )}
            >
              {event.name}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredImages.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--color-bg-card)] cursor-pointer animate-fade-in opacity-0"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => openLightbox(index)}
          >
            {/* Placeholder for when images are missing */}
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-elevated)]">
              <Camera className="w-12 h-12 text-[var(--color-text-muted)]" />
            </div>

            {/* Actual image would go here with Next/Image */}
            {/* <Image
              src={image.image_url}
              alt={image.caption || "Gallery image"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            /> */}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {image.caption && (
                  <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                    {image.caption}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-white/70">
                  {image.event_name && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {image.event_name}
                    </span>
                  )}
                  {image.photographer && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {image.photographer}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Hover zoom icon */}
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-16">
          <Camera className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">
            No photos available for this event yet.
          </p>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
        }}
      />
    </>
  );
}

