import {createContext, useContext, useEffect, useState} from "react";
import {createHash} from 'crypto-browserify';
// import {useRawInitData} from '@telegram-apps/sdk-react';
import {getUid, setUid} from "../utils/storage.js";

const mockUser = {
    id: 123456789,
    hash: 123456789,
    first_name: 'Dev',
    last_name: 'User',
    username: 'devuser',
    photo_url: 'https://via.placeholder.com/150',
};

function getTelegramUser() {
    if (import.meta.env.DEV && !useRawInitData?.user) {
        return mockUser;
    }
    // return useRawInitData?.user || null;
}

export function waitForTelegramInit() {
    return new Promise((resolve) => {
        // init();
        const useInitData = getTelegramUser();
        if (useInitData) {

            resolve(useInitData);
        } else {
            const uid = getUid();
            if (!uid) {
                resolve({hash: generateHash()});
            } else {
                resolve({hash: uid});
            }

        }
    });
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
        async function init() {
            const userInfo = await waitForTelegramInit();
            setUser(userInfo);
            setReady(true);
            setUid(userInfo.hash)
        }

        init();

    }, []);

    return (
        <AuthContext.Provider value={{user}}>
            {ready ? children : <p className="p-4 text-center">Loading...</p>}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
