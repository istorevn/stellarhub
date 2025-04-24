import BottomNav from "../components/BottomNav";
import AddressSelector from "../components/AddressSelector.jsx";
import {useAddressContext} from "../contexts/AddressContext.jsx";

export default function MainLayout({ children }) {
    const {currentAddress, addresses} = useAddressContext();
    return (
        <div className="min-h-screen h-screen flex flex-col pb-16">
            {currentAddress && <AddressSelector /> }
            <div className="flex-1 pb-16">{children}</div>
            {currentAddress && <BottomNav /> }
        </div>
    );
}
