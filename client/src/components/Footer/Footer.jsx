import React from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { MailIcon, PhoneCallIcon } from "lucide-react";

function Footer() {
	const footerLinks = [
		{ title: "Home", url: "/" },
		{ title: "About us", url: "/about-us" },
		{ title: "Terms and Conditions", url: "/terms-and-conditions" },
		{ title: "Contact us", url: "/contact-us" },
		{ title: "Privacy policy", url: "/privacy-policy" },
	];

	return (
		<footer className="px-6 mt-40 md:px-16 lg:px-36 w-full text-gray-300">
			<div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
				<div className="md:max-w-96">
					<img className="w-72 h-auto" src={assets.logo} alt="logo" />
					<p className="mt-6 text-sm">
						Priyadarshini is more than just a movie platform — it’s a celebration of storytelling, culture, and connection. From timeless
						classics to the latest blockbusters, we bring cinema to life with comfort, quality, and a passion for unforgettable
						experiences.
					</p>
					<div className="flex items-center gap-2 mt-4">
						<img src={assets.googlePlay} alt="google play" className="h-9 w-auto" />
						<img src={assets.appStore} alt="app store" className="h-9 w-auto" />
					</div>
				</div>
				<div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
					<div>
						<h2 className="font-semibold mb-5">Company</h2>
						<ul className="text-sm space-y-2">
							{footerLinks.map((link, index) => (
								<li key={index}>
									<Link to={link.url} className="hover:text-primary transition">
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h2 className="font-semibold mb-5">Get in touch</h2>
						<div className="text-sm space-y-2">
							<div className="flex items-center gap-2">
								<PhoneCallIcon className="w-3.5 h-3.5 inline-block mr-1" />
								<p>+91-8480476322</p>
							</div>
							<div className="flex items-center gap-2">
								<MailIcon className="w-3.5 h-3.5 inline-block mr-1" />
								<p>priyadarshini.cinema+contact@gmail.com</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<p className="pt-4 text-center text-sm pb-5">Copyright {new Date().getFullYear()} © Priyadarshini Cinemas. All Right Reserved.</p>
		</footer>
	);
}

export default Footer;
