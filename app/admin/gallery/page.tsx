"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  X,
  Check,
} from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  photographer: string | null;
  event_name: string;
  upload_date: string;
}

export default function AdminGalleryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
    fetchImages();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const fetchImages = async () => {
    setIsLoading(true);
    
    // Placeholder data
    setImages([
      {
        id: "1",
        image_url: "/gallery/event-1.jpg",
        caption: "N*D performing live",
        photographer: "John Doe",
        event_name: "Amplify 2025",
        upload_date: "2025-08-01",
      },
      {
        id: "2",
        image_url: "/gallery/event-2.jpg",
        caption: "Crowd at the venue",
        photographer: null,
        event_name: "Amplify 2025",
        upload_date: "2025-08-01",
      },
      {
        id: "3",
        image_url: "/gallery/event-3.jpg",
        caption: "Jimmy Was Busy on stage",
        photographer: "Jane Smith",
        event_name: "Amplify 2025",
        upload_date: "2025-08-01",
      },
    ]);
    
    setIsLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Would upload to Supabase Storage
    for (const file of files) {
      console.log("Uploading:", file.name);
      // const { data, error } = await supabase.storage
      //   .from("gallery")
      //   .upload(`${Date.now()}-${file.name}`, file);
    }

    // Refresh the gallery
    await fetchImages();
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    // Would delete from Supabase
    setImages(images.filter(img => img.id !== id));
    setSelectedImages(selectedImages.filter(imgId => imgId !== id));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) return;
    
    // Would delete from Supabase
    setImages(images.filter(img => !selectedImages.includes(img.id)));
    setSelectedImages([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedImages(prev =>
      prev.includes(id)
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(img => img.id));
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activePage="gallery" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Photo Gallery</h1>
            <p className="text-[var(--color-text-secondary)]">
              Manage event photos
            </p>
          </div>
          <div className="flex gap-2">
            {selectedImages.length > 0 && (
              <Button
                variant="danger"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedImages.length})
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => fileInputRef.current?.click()}
              loading={isUploading}
            >
              <Upload className="w-4 h-4" />
              Upload Photos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>

        {/* Selection Controls */}
        {images.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                selectedImages.length === images.length
                  ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                  : "border-white/20"
              }`}>
                {selectedImages.length === images.length && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              Select All
            </button>
            <span className="text-[var(--color-text-muted)] text-sm">
              {images.length} images
            </span>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card
              key={image.id}
              className={`group relative overflow-hidden cursor-pointer ${
                selectedImages.includes(image.id) ? "ring-2 ring-[var(--color-accent)]" : ""
              }`}
              onClick={() => toggleSelect(image.id)}
            >
              {/* Image */}
              <div className="aspect-square bg-[var(--color-bg-elevated)] flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-[var(--color-text-muted)]" />
              </div>

              {/* Selection Checkbox */}
              <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                selectedImages.includes(image.id)
                  ? "bg-[var(--color-accent)]"
                  : "bg-black/50 opacity-0 group-hover:opacity-100"
              }`}>
                {selectedImages.includes(image.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(image.id);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-[var(--color-error)]"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Caption */}
              <CardContent className="p-3">
                <p className="text-sm text-white truncate">
                  {image.caption || "No caption"}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {image.event_name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {images.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] mb-4">
              No photos uploaded yet
            </p>
            <Button
              variant="default"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload Your First Photo
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

