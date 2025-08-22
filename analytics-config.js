/**
 * Analytics config (privacy-friendly; self-hostable).
 * Pick ONE provider, fill your details, and set enabled:true.
 * Until you modify this file, no network requests will be sent.
 */
window.ANALYTICS = {
  // Respect Do Not Track
  respectDNT: true,

  // Only run on production host (set to your domain if你有独立域名)
  hosts: ["chiangmaisummer.github.io"],

  // Choose: "umami" or "plausible" (or leave empty to disable)
  provider: "",

  // Umami (self-host: https://umami.is/docs)
  umami: {
    enabled: false,
    websiteId: "REPLACE-WEBSITE-ID-UUID",
    src: "https://analytics.example.com/script.js" // your Umami script URL
  },

  // Plausible (self-host: https://plausible.io/docs/self-hosting)
  plausible: {
    enabled: false,
    domain: "chiangmaisummer.github.io",
    src: "https://plausible.io/js/script.js" // or your self-host URL e.g. https://stats.example.com/js/script.js
  }
};
