import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import config from "./config/config.js";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { AppContextProvider } from "./context/AppContextProvider.jsx";

const PUBLISHABLE_KEY = config.clerkPublishableKey;

if (!PUBLISHABLE_KEY) {
	throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")).render(
	<ClerkProvider appearance={{ baseTheme: dark }} publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
		<BrowserRouter>
			<AppContextProvider>
				<App />
			</AppContextProvider>
		</BrowserRouter>
	</ClerkProvider>
);
