import { useState } from "react";
import useAppContext from "../../hooks/useAppContext.js";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Title } from "../../components/index.js";

function VerifyBooking() {
	const { axios } = useAppContext();
	const [token, setToken] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [result, setResult] = useState(null);

	const handleVerify = async () => {
		if (!token.trim()) {
			toast.error("Please enter a QR token");
			return;
		}

		setIsVerifying(true);
		setResult(null);

		try {
			const { data } = await axios.get(`/booking/verify/${token.trim()}`);

			if (data.success) {
				setResult({ type: "success", data });
			} else {
				setResult({ type: "error", msg: data.message || "Verification failed" });
			}
		} catch (error) {
			const msg = error?.response?.data?.message || "Server error";
			setResult({ type: "error", msg });
		} finally {
			setIsVerifying(false);
			setToken(""); // optional: reset after submit
		}
	};

    return (
		<div>
			<Title text1="🎟️ Booking QR" text2="Verification" />

			<div className="max-w-4xl mt-6">
				{/* Input + Button */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
					<input
						type="text"
						value={token}
						onChange={(e) => setToken(e.target.value)}
						placeholder="Enter or paste QR token here"
						className="border border-gray-500 bg-transparent text-sm px-4 py-2 rounded-md w-full sm:max-w-md focus:outline-none focus:border-primary"
					/>
					<button
						onClick={handleVerify}
						disabled={isVerifying}
						className="bg-primary hover:bg-primary-dull transition px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
					>
						{isVerifying ? <LoaderCircle className="animate-spin w-4 h-4" /> : "Verify"}
					</button>
				</div>

				{/* Result */}
				{result && result.type === "success" && (
					<div className="bg-green-800/10 border border-green-500/20 rounded-lg p-4 text-sm text-green-300">
						<p className="mb-2 font-semibold">✅ Ticket Verified</p>
						<p>
							<span className="text-gray-400">Movie:</span> {result.data.data.movie}
						</p>
						<p>
							<span className="text-gray-400">Seats:</span> {result.data.data.seats.join(", ")}
						</p>
						<p>
							<span className="text-gray-400">Customer Name:</span> {result.data.data.user}
						</p>
					</div>
				)}

				{result && result.type === "error" && (
					<div className="bg-red-800/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-300">
						<p className="font-semibold">❌ Verification Failed</p>
						<p>{result.msg}</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default VerifyBooking;
