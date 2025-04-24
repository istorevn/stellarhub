import './App.css'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import Swap from "./pages/Swap";
import MainLayout from "./layout/MainLayout";
import {AddressProvider} from "./contexts/AddressContext";
import Trustlines from "./pages/Trustlines";
import History from "./pages/History.jsx";
import ImportAddress from "./pages/Address/ImportAddress.jsx";
import CreateAddress from "./pages/Address/CreateAddress.jsx";
import NewAddress from "./pages/Address/NewAddress.jsx";
import RecoveryPhrase from "./pages/Address/RecoveryPhrase.jsx";
import { PrimeReactProvider } from 'primereact/api';
import AddressSettings from "./pages/Address/AddressSettings.jsx";

export default function App() {
    return (
        <PrimeReactProvider>
        <Router>
            <AddressProvider>
                <MainLayout>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/send" element={<Send/>}/>
                        <Route path="/receive" element={<Receive />} />
                        <Route path="/swap" element={<Swap />} />
                        <Route path="/trustlines" element={<Trustlines />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/importAddress" element={<ImportAddress />} />
                        <Route path="/createAddress" element={<CreateAddress />} />
                        <Route path="/newAddress" element={<NewAddress />} />
                        <Route path="/recovery" element={<RecoveryPhrase />} />
                        <Route path="/setting" element={<AddressSettings />} />
                    </Routes>
                </MainLayout>
            </AddressProvider>
        </Router>
        </PrimeReactProvider>
    );
}
