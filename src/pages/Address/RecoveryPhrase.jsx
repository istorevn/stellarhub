import { useLocation, useNavigate } from "react-router-dom";

export default function RecoveryPhrase() {
    const location = useLocation();
    const navigate = useNavigate();
    const secret = location.state?.secret;

    const handleConfirm = () => {
        navigate("/"); // Go back to Home
    };

    if (!secret) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500">⚠️ Secret key not found.</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-center">🧠 Recovery Phrase</h2>
            <p className="text-sm text-gray-700">
                This is your secret key. Write it down and keep it safe. You will need it to access your wallet.
            </p>
            <div className="bg-gray-100 rounded p-4 text-sm font-mono whitespace-pre-wrap text-center break-all text-xs">
                {secret}
            </div>
            <button
                onClick={handleConfirm}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full"
            >
                ✅ I saved my secret key
            </button>
        </div>
    );
}
