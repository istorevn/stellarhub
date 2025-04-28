import {createContext, useContext, useEffect, useState} from "react";
import {createHash} from 'crypto-browserify';
import {useRawInitData} from '@telegram-apps/sdk-react';
import {getUid, setUid} from "../utils/storage.js";

const mockUser = {
    id: 123456789,
    hash: 123456789,
    first_name: 'Dev',
    last_name: 'User',
    username: 'devuser',
    photo_url: 'https://via.placeholder.com/150',
};

function getTelegramUser(timeout = 3000) {

    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = () => {
            if (window.Telegram?.WebApp?.initDataUnsafe) {
                resolve(window.Telegram.WebApp.initDataUnsafe);
            } else if (Date.now() - start > timeout) {
                reject(new Error("Timeout waiting for Telegram init."));
            } else {
                setTimeout(check, 100);
            }
        };

        check();
    });
}

export async function waitForTelegramInit() {

    if (import.meta.env.DEV && !useRawInitData?.user) {
        return mockUser;
    }

    if (typeof window === "undefined" || !window.Telegram || !window.Telegram.WebApp) {
        throw new Error("Telegram WebApp SDK is not available.");
    }

    const useInitData = await getTelegramUser();
    if (useInitData) {

        return useInitData;
    } else {
        const uid = getUid();
        if (!uid) {
            return {user: {hash: generateHash()}};
        } else {
            return {user: {hash: uid}};
        }
    }
}

export const AuthContext = createContext();

function generateHash() {
    const userAgent = navigator.userAgent || '';
    const randomSeed = Date.now().toString() + Math.random().toString();
    const input = userAgent + randomSeed;
    return createHash('sha256').update(input).digest('hex');
}

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (import.meta.env.DEV) {
            setUser(mockUser);
        }
        if (useRawInitData) {
            setUser(useRawInitData?.user || null);
        }
    }, [useRawInitData]);

    useEffect(() => {
        async function init() {
            let userInfo;
            if (import.meta.env.DEV) {
                userInfo = mockUser;
                setUser(userInfo);
                setReady(true);
                setUid(userInfo.hash)
            }else{
                if (useRawInitData) {
                    userInfo = useRawInitData?.user || null;
                    setUser(userInfo);
                    setReady(true);
                    setUid(userInfo.hash)
                }
            }

        }

        init();

    }, [useRawInitData]);

    return (
        <AuthContext.Provider value={{user}}>
            {ready ? children : <p className="p-4 text-center">Loading...</p>}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
