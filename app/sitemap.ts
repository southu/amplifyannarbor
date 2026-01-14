import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amplifyannarbor.com";

  // Static pages
  const staticPages = [
    "",
    "/sponsors",
    "/events",
    "/about",
    "/gallery",
    "/blog",
    "/merch",
    "/donate",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // In production, you would fetch dynamic pages from Supabase
  // const blogPosts = await supabase.from("blog_posts").select("slug, updated_at")...
  // const blogPages = blogPosts.map(post => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: new Date(post.updated_at),
  //   changeFrequency: "monthly",
  //   priority: 0.6,
  // }));

  return [...staticPages];
}

