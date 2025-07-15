// import { WEBSITE_URL } from "../../../server/config/env.js";

import { BlurCircle } from "../components";
import config from "../config/config";

function TermsAndConditions() {
	return (
		<div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
			<BlurCircle top="150px" left="0px" />
			<BlurCircle bottom="50px" right="50px" />
			<h1 className="text-3xl md:text-4xl font-semibold mb-6">Terms & Conditions</h1>

			<p className="mb-4">
				Thank you for accessing/shopping at <strong>{config.websiteUrl}</strong>. This site is owned and operated by Priyadarshini Cinemas
				(hereinafter referred to as “Priyadarshini”). By using or shopping on this site, you indicate your unconditional acceptance of these
				terms & conditions.
			</p>

			<p className="mb-4">
				Priyadarshini reserves the right, at our discretion, to update or revise these terms at any time. Continued use of the site after any
				such changes constitutes your acceptance of those changes.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">1. Eligibility to Use</h2>
			<p className="mb-4">
				Use of this site is available only to persons who can legally enter into contracts under applicable law. If you are under 18 or
				otherwise "incompetent to contract" as per the Indian Contract Act, 1872, you may not use this site.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">2. Account Requirements</h2>
			<p className="mb-4">
				It is mandatory to create an account or log in to an existing one in order to book tickets on Priyadarshini. This ensures a
				personalized and secure booking experience. Bookings without a valid account will not be permitted.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">3. Electronic Communication</h2>
			<p className="mb-4">
				By communicating with us electronically, you consent to receive communications from us electronically, including emails,
				notifications, and updates.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">4. Reviews & Submissions</h2>
			<p className="mb-4">
				All reviews, comments, feedback, and suggestions submitted to Priyadarshini become our property. We reserve the right to use, modify,
				and display such content without compensation or obligation.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">5. Content Accuracy</h2>
			<p className="mb-4">
				We strive for accuracy in all listings, but typographical errors may occur. We reserve the right to correct pricing or content errors
				and cancel orders that arise due to such issues.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">6. Payment & Ticketing</h2>
			<p className="mb-4">
				All bookings are final once payment is completed. Booked tickets are non-refundable and cannot be cancelled. Please review show
				details and seat selections carefully before confirming.
			</p>

			<h2 className="text-xl font-semibold mt-8 mb-2">7. Site Access</h2>
			<p className="mb-4">
				We reserve the right to restrict or terminate access to our site at any time without prior notice for any user who violates these
				terms or disrupts our services.
			</p>

			<p className="mt-10 text-sm text-gray-400">
				Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
			</p>
		</div>
	);
}

export default TermsAndConditions;
