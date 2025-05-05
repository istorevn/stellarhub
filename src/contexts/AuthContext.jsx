import {createContext, useContext, useEffect, useState} from "react";
import {createHash} from 'crypto-browserify';
import { isTMA, useLaunchParams} from '@telegram-apps/sdk-react';
import {getUid, setUid} from "../utils/storage.js";
const mockUser = {
    id: '123456789',
    hash: generateHash().toString(),
    first_name: 'Dev',
    last_name: 'User',
    username: 'devuser',
    photo_url: 'https://via.placeholder.com/150',
};

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
    let initData = null;
    if(isTMA()){
        initData = useLaunchParams();
    }
    console.log('useLaunchParams', initData)

    useEffect(() => {
        console.log('initData', initData?.tgWebAppData)
        if (initData?.tgWebAppData) {
            setUser(initData.tgWebAppData.user);
            setUid(initData.tgWebAppData.hash)
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

    }, [initData]);

    return (
        <AuthContext.Provider value={{user}}>
            {ready ? children : <p className="p-4 text-center">Loading...</p>}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
