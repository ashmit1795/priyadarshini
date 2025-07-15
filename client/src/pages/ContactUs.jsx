import { useState } from "react";
import toast from "react-hot-toast";
import useAppContext from "../hooks/useAppContext";
import { BlurCircle } from "../components";

function ContactUs() {
    const { axios, user } = useAppContext();

	const [formData, setFormData] = useState({
		name: user.fullName || "",
		email: user.primaryEmailAddress.emailAddress || "",
		message: "",
    });
    


	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const { data } = await axios.post("/contact/", formData);
			if (data.success) {
				toast.success("Message sent successfully!");
				setFormData({ message: "" });
			} else {
				toast.error(data.message || "Failed to send message");
			}
		} catch (err) {
			console.error(err);
			toast.error("Something went wrong");
		}
	};

	return (
		<div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">

            <BlurCircle top="50px" left="0px" />
            <BlurCircle bottom="50px" right="50px" />

            <h1 className="text-3xl font-semibold mb-8">Contact Us</h1>
			<form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
				<input
					type="text"
					name="name"
					placeholder="Your Name"
					value={formData.name}
					onChange={handleChange}
					required
					className="w-full p-3 rounded bg-gray-800 border border-gray-700"
				/>
				<input
					type="email"
					name="email"
					placeholder="Your Email"
					value={formData.email}
					onChange={handleChange}
					required
					className="w-full p-3 rounded bg-gray-800 border border-gray-700"
				/>
				<textarea
					name="message"
					placeholder="Your Message"
					value={formData.message}
					onChange={handleChange}
					required
					rows={5}
					className="w-full p-3 rounded bg-gray-800 border border-gray-700"
				></textarea>
				<button type="submit" className="px-6 py-3 rounded-full bg-primary hover:bg-primary-dull font-medium">
					Send Message
				</button>
			</form>
		</div>
	);
}

export default ContactUs;
// This component allows users to contact the site administrators by filling out a form.