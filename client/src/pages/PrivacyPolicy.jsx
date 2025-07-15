import { BlurCircle } from "../components";

function PrivacyPolicy() {
	return (
		<div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
			<BlurCircle top="150px" left="0px" />
			<BlurCircle bottom="50px" right="50px" />

			<h1 className="text-3xl md:text-4xl font-semibold mb-6">Privacy Policy</h1>

			<p className="mb-4 text-sm text-gray-400">
				<strong>Last Updated:</strong> {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
			</p>

			<p className="mb-4">
				At <strong>Priyadarshini</strong>, we are committed to safeguarding your privacy. We never sell, rent, or share your personal data
				with third parties without your explicit consent. By using our website, you agree to the terms of this Privacy Policy. If you do not
				agree, please do not use or access the site.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">Information We Collect</h2>
			<p className="mb-4">
				We collect personal information such as your name, email, contact number, and booking history to provide a secure and personalized
				experience. This helps us process your orders, respond to inquiries, and improve your user experience.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">Security & Confidentiality</h2>
			<p className="mb-4">
				Your data is protected through physical, electronic, and procedural safeguards. Only authorized personnel have access to it. Any
				violation of our data policies by employees will result in disciplinary action, including possible termination and legal consequences.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">Cookies & Tracking</h2>
			<p className="mb-4">We use cookies to enhance your experience, remember your preferences, and provide relevant content. These include:</p>
			<ul className="list-disc list-inside mb-4 space-y-1">
				<li>
					<strong>Essential cookies:</strong> Required for site functionality.
				</li>
				<li>
					<strong>Functional cookies:</strong> Remember your preferences like location and login.
				</li>
				<li>
					<strong>Analytics cookies:</strong> Help us understand site usage and performance.
				</li>
				<li>
					<strong>Advertising cookies:</strong> Serve you personalized ads on and off our platform.
				</li>
			</ul>
			<p className="mb-4">
				You may disable cookies via your browser settings, but certain features of the site may be unavailable as a result.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">IP Address & Device Info</h2>
			<p className="mb-4">We collect your IP address and device data to monitor usage patterns, ensure security, and improve our services.</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">Third-Party Services</h2>
			<p className="mb-4">
				Our site may include links to external websites. We are not responsible for the privacy practices or content of such sites. Please
				read their privacy policies before sharing your information.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">Cookie Control & Deletion</h2>
			<p className="mb-4">
				You can clear cookies manually via your browser settings. In Google Chrome: go to Settings → Privacy & Security → Clear Browsing Data
				→ Cookies & Site Data.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">Your Consent</h2>
			<p className="mb-4">
				By using Priyadarshini, you consent to the collection and use of your information in accordance with this Privacy Policy. We may
				update this policy from time to time, and continued use of the site implies your agreement to the updated terms.
			</p>

			<p className="mt-10 text-sm text-gray-400">
				If you have any questions or concerns about our Privacy Policy, feel free to contact our support team.
			</p>
		</div>
	);
}

export default PrivacyPolicy;
