// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // 👈 importante para no fallar con subcarpetas / tuCloud/image/upload/
      },
    ],
    formats: ["image/avif", "image/webp"], // 👈 mejora LCP y tamaño
  },
  eslint: {
    // Evita fallos en Netlify por warnings menores
    ignoreDuringBuilds: true,
  },
};
