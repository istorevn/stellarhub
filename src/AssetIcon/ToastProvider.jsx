import { createContext, useContext, useState, useCallback } from "react";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";

const ToastContext = createContext();

let id = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((type, message, duration = 3000) => {
        const newToast = { id: id++, type, message };
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast list */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Transition
                        key={toast.id}
                        as={Fragment}
                        show={true}
                        enter="transition ease-out duration-300 transform"
                        enterFrom="opacity-0 translate-y-4"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-200 transform"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-4"
                    >
                        <div
                            className={`px-4 py-2 rounded shadow text-white text-sm font-medium ${
                                toast.type === "success"
                                    ? "bg-green-600"
                                    : toast.type === "error"
                                        ? "bg-red-600"
                                        : toast.type === "warning"
                                            ? "bg-yellow-500"
                                            : "bg-blue-600"
                            }`}
                        >
                            {toast.message}
                        </div>
                    </Transition>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
