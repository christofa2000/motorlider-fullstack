/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  eslint: {
    // Avoid failing the Netlify build on lint errors
    ignoreDuringBuilds: true,
  },
};
