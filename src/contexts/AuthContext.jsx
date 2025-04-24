import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user) {
            setUser(tg.initDataUnsafe.user);
        }
        setReady(true);
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {ready ? children : <p className="p-4 text-center">Loading...</p>}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
