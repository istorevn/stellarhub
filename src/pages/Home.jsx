import {useAddressContext} from "../contexts/AddressContext";
import Balances from "../components/Balances.jsx";
import {Link} from "react-router-dom";

export default function Home() {
    const {currentAddress} = useAddressContext();

    if (!currentAddress) {
        return <div className={'p-4 max-w-sm mx-auto'}>
            <div className={'text-base my-3 font-semibold'}>Single access point to Stellar universe</div>
            <div className={'text-sm my-3 text-gray-600'}>StellarHub is not a custodian of your assets. We <b>do not store </b>
                any tokens, cryptoassets or private keys on your behalf, everything is encrypted and stored in the
                browser
            </div>
            <div className={'text-sm my-3 text-gray-600'}>StellarHub helps you manage multiple accounts and easily send,
                receive, and swap any tokens on the stellar network
            </div>
            <div className={''}>
                <Link
                    to="/createAddress"
                    className="my-3 bg-blue-600 text-white text-sm py-3 px-4 rounded font-semibold w-full block"

                >
                    Create Wallet
                </Link>
                <div
                    className="pb-2 flex items-center text-sm text-gray-600 before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 ">
                    already have an account?
                </div>

                <Link
                    to="/importAddress"
                    className="my-3 border-2 border-blue-600 hover:border-blue-700 text-blue-600 text-sm py-3 px-4 rounded w-full block font-semibold"
                >
                    Import Wallet
                </Link>
            </div>

        </div>;
    }

    return (
        <div className="p-4">
            {/*<h1 className="text-xl font-bold mb-4">📱 Home</h1>*/}

            <Balances/>
        </div>
    );
}
