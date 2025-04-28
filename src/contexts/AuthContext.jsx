import {createContext, useContext, useEffect, useState} from "react";
import {createHash} from 'crypto-browserify';
import {init,useLaunchParams } from '@telegram-apps/sdk-react';
import {getUid, setUid} from "../utils/storage.js";
init();
const mockUser = {
    id: 123456789,
    hash: 123456789,
    first_name: 'Dev',
    last_name: 'User',
    username: 'devuser',
    photo_url: 'https://via.placeholder.com/150',
};

function getTelegramUser(timeout = 3000) {
    console.log('getTelegramUser env', import.meta.env.DEV)
    if (import.meta.env.DEV) {
        return mockUser;
    }
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = () => {
            let initData = useLaunchParams()
            if (initData?.user) {
                console.log('getTelegramUser useRawInitData', initData)

                resolve(initData?.user);
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
    const initDataUnsafe = useLaunchParams();
    useEffect(() => {
        console.log('initData', initDataUnsafe)
        if (initDataUnsafe) {
            setUser(initDataUnsafe.user);
            setUid(initDataUnsafe.user.hash)
            setReady(true);
        }else{
            if (import.meta.env.DEV) {
                setUser(mockUser);

                const uid = getUid();
                if (!uid) {
                    setUid(generateHash())
                } else {
                    setUid(generateHash(uid))
                }
                setReady(true);
            }
        }

    }, [initDataUnsafe]);

    return (
        <AuthContext.Provider value={{user}}>
            {ready ? children : <p className="p-4 text-center">Loading...</p>}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
