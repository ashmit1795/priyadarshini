const config = {
	clerkPublishableKey: String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
	currency: String(import.meta.env.VITE_CURRENCY),
	serverUrl: String(import.meta.env.VITE_SERVER_URL) || "http://localhost:3000",
	tmdbImageBaseUrl: String(import.meta.env.VITE_TMDB_IMAGE_BASE_URL),
	websiteUrl: String(import.meta.env.VITE_WEBSITE_URL) || "http://localhost:5173",
};

export default config;