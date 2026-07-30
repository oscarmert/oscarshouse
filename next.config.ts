import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the project root explicitly. Without this, Turbopack can get
  // confused if there's a stray lockfile in a parent directory (e.g. a
  // global package-lock.json in your user folder on Windows) and silently
  // picks the wrong root — this just avoids that warning/ambiguity.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
