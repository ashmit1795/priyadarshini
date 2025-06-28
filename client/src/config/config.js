const config = {
	clerkPublishableKey: String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
	currency: String(import.meta.env.VITE_CURRENCY)
};

export default config;