import { useState } from "react";
import toast from "react-hot-toast";
import useAppContext from "../hooks/useAppContext";
import { BlurCircle } from "../components";
import { Loader } from "lucide-react";

function ContactUs() {
    const { axios, user } = useAppContext();
    const [sending, setSending] = useState(false);

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
        setSending(true);
		try {
			const { data } = await axios.post("/contact/", formData);
			if (data.success) {
				toast.success("Message sent successfully!");
                setFormData({ message: "" });
			} else {
                toast.error(data.message || "Failed to send message");
            }
            setSending(false);
		} catch (err) {
			console.error(err);
            toast.error("Something went wrong");
            setSending(false);
		}
	};

	return (
		<div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
			<BlurCircle top="50px" left="0px" />
			<BlurCircle bottom="50px" right="50px" />

			<h1 className="text-3xl md:text-4xl font-semibold mb-6">Contact Us</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <p className="block text-gray-300 font-medium mb-2">We'd love to hear from you!</p>
                <p className="text-gray-400 mb-4">Have questions, feedback, or just want to say hello? Fill out the form below and we'll get back to you as soon as possible.</p>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
					type="text"
					name="name"
					placeholder="Your Name"
					value={formData.name}
					onChange={handleChange}
					required
					className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                />
                <label className="block text-sm font-medium mb-2">Your Email</label>
				<input
					type="email"
					name="email"
					placeholder="Your Email"
					value={formData.email}
					onChange={handleChange}
					required
					className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                />
                <label className="block text-sm font-medium mb-2">Message</label>
				<textarea
					name="message"
					placeholder="Your Message"
					value={formData.message}
					onChange={handleChange}
					required
					rows={5}
					className="w-full p-3 rounded bg-gray-800 border border-gray-700"
				></textarea>
				{!sending ? (
					<button type="submit" className="px-6 py-3 rounded-full bg-primary hover:bg-primary-dull font-medium">
						Send Message
					</button>
				) : (
					<Loader className="w-6 h-6 animate-spin text-primary" />
				)}
			</form>
		</div>
	);
}

export default ContactUs;
// This component allows users to contact the site administrators by filling out a form.