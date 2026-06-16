import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amplify Ann Arbor",
    short_name: "Amplify AA",
    description:
      "Charity concert supporting Ann Arbor Meals on Wheels with live grunge-rock performances.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f1a",
    theme_color: "#e94560",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
