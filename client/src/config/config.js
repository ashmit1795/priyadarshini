const config = {
	clerkPublishableKey: String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
	currency: String(import.meta.env.VITE_CURRENCY),
	serverUrl: String(import.meta.env.VITE_SERVER_URL) || "http://localhost:3000",
};

export default config;