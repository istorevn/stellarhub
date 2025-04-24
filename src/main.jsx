import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ToastProvider} from "./components/ToastProvider.jsx";
import {AuthProvider} from "./contexts/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <ToastProvider>
                <App/>
            </ToastProvider>
        </AuthProvider>
    </StrictMode>,
)
