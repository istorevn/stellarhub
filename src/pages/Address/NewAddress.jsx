import { useNavigate } from "react-router-dom";

export default function NewAddress() {
    const navigate = useNavigate();

    const handleProcess = () => {
        navigate("/createAddress");
    };

    return (
        <div className="flex flex-col items-center min-h-screen px-4 text-center">
            <div className=" w-full space-y-6 pt-4">
                <h1 className="text-2xl font-bold">🚀 Create a New Stellar Wallet</h1>
                <p className="text-left text-sm text-gray-600">
                    StellarHub provides a safe and reliable way to use Stellar accounts without trusting anyone with your
                    secret key. We don't have access to any sensitive data, everything is encrypted and stored in the
                    browser.
                </p>
                <p className="text-left text-sm text-gray-600">
                    It works like a bridge for other applications that allows them to ask your permission to sign
                    transactions or verify identity on your behalf, so you can use the same account across the whole
                    universe of Stellar applications. StellarHub is open-source and free to use for everyone.
                </p>
                <p className="text-left text-sm text-gray-600">
                    Your information and funds are protected, but please remember:
                </p>
                <button
                    onClick={handleProcess}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded w-full"
                >
                    Process
                </button>


            </div>
        </div>
    );
}
