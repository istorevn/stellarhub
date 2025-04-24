import {Link, useLocation} from "react-router-dom";

export default function BottomNav() {
    const {pathname} = useLocation();

    const links = [
        {to: "/", label: "🏠", text: "Home"},
        {to: "/send", label: "📤", text: "Send"},
        {to: "/receive", label: "📥", text: "Receive"},
        {to: "/swap", label: "💱", text: "Swap"}
    ];

    return (
        <div className="bg-white border-t border-gray-300 shadow fixed bottom-0 left-0 w-full z-40 h-16">
            <div className="flex justify-around py-2 ">

                {links.map(({to, label, text}) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex flex-col items-center text-sm ${
                            pathname === to ? "text-blue-600 font-semibold" : "text-gray-700"
                        }`}
                    >
                        <span>{label}</span>
                        <span>{text}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
