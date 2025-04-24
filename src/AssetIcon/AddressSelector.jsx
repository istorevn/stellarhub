import {useState} from "react";
import {Listbox} from "@headlessui/react";
import {useAddressContext} from "../contexts/AddressContext";
import {Link, useLocation} from "react-router-dom";
import {accountHref, shortAddr} from "../utils/txSummary.js";
import {Sidebar} from "primereact/sidebar";
import {Button} from "primereact/button";
import {
    Bars4Icon, ChevronDownIcon,
    ChevronRightIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    MagnifyingGlassIcon, PlusIcon
} from "@heroicons/react/16/solid/index.js";
import {useToast} from "./ToastProvider.jsx";

export default function AddressSelector() {
    const {
        addresses,
        addressMap,
        currentAddress,
        setCurrentAddress,
        network,
        setNetwork,
    } = useAddressContext();

    const [visible, setVisible] = useState(false);


    const location = useLocation();
    const {showToast} = useToast();
    const handleSwitchNetwork = (value) => {
        if (value !== network) {
            setNetwork(value);
            setVisibleNetwork(false)
            window.location.reload();
        }
    };
    const [visibleNetwork, setVisibleNetwork] = useState(false);

    const handleCopyAddr = () => {
        if (!currentAddress) return;
        navigator.clipboard.writeText(currentAddress);
        showToast('success', 'Copied')
    };

    const handleSelectAddr = (value) => {
        setCurrentAddress(value);
        setVisible(false)
    };
    return (
        <div className="mb-2 border-b border-gray-200 shadow text-sm py-2">

            <div className="grid grid-cols-3 items-center mb-2">
                <div className={'grid text-left'}>

                    <Sidebar position="top" visible={visible} onHide={() => {
                        setVisible(false)
                    }}
                             className={'px-4  h-2/3 pt-2 relative'}
                             header={<div className={'text-center mt-3 text-blue-500'}>
                                 {shortAddr(currentAddress, 6)}
                             </div>}
                    >

                        {currentAddress &&
                            <Link to="/setting" onClick={() => setVisible(false)}
                                className={"flex w-full px-2 my-2 text-sm cursor-pointer text-gray-600 border-t border-gray-300 pt-3 content-end"}>
                                <Cog6ToothIcon className={'size-3 mt-1 mr-1'}/>
                                Setting this account
                            </Link>
                        }
                        {currentAddress &&
                            <a href={accountHref(currentAddress)}
                               target={'_blank'}
                               className={"w-full flex px-2 my-2 text-sm cursor-pointer  text-gray-600"}>
                                <MagnifyingGlassIcon className={'size-3 mt-1 mr-1'}/>
                                View on StellarExpert</a>
                        }

                        <Link to="/newAddress"  onClick={() => setVisible(false)}
                              className={"flex px-2 pb-3 w-full my-2 text-sm cursor-pointer text-gray-600 border-b border-gray-300"}>
                            <PlusIcon className={'size-3 mt-1 mr-1'}/> Create/Or new wallet
                        </Link>

                        {addresses.filter((addr) => addr != currentAddress).map((addr) => (
                            <div onClick={() => handleSelectAddr(addr)}
                                 key={addr}
                                 className="px-2 py-1 my-1 text-sm cursor-pointer text-gray-600 flex "
                            >
                                <ChevronRightIcon className={'size-3 mt-1 mr-1'} /> {addressMap[addr]?.name || addr} ({shortAddr(addr)})
                            </div>
                        ))}

                        <div className={'flex mt-3 border-t border-gray-300 justify-between'}>
                                <span
                                    className={"py-1 px-3 my-3 text-sm cursor-pointer text-gray-600"}>2025 ©&nbsp;StellarHub </span>
                            <Link to="/newAddress" className={"py-1 px-3 my-3 text-sm cursor-pointer "}>
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20"
                                     viewBox="0 0 24 24">
                                    <path
                                        d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.6,5,2.5,9.3,6.9,10.7v-2.3c0,0-0.4,0.1-0.9,0.1c-1.4,0-2-1.2-2.1-1.9 c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1c0.4,0,0.7-0.1,0.9-0.2 c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6c0,0,1.4,0,2.8,1.3 C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4c0.7,0.8,1.2,1.8,1.2,3 c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v3.3c4.1-1.3,7-5.1,7-9.5C22,6.1,16.9,1.4,10.9,2.1z"></path>
                                </svg>
                            </Link>
                        </div>
                    </Sidebar>
                    <button onClick={() => setVisible(true)} className={'ml-4'}>
                        <Bars4Icon className={'size-4'}/>
                    </button>
                </div>

                <div>
                    <div>
                        {currentAddress
                            ? addressMap[currentAddress]?.name || currentAddress
                            : "Select wallet"}
                    </div>
                    <div className={'flex justify-center item-center text-gray-600 network'} onClick={handleCopyAddr}
                    >
                        {currentAddress
                            ? `${shortAddr(addressMap[currentAddress]?.publicKey, 4)}`
                            : ""}
                        <DocumentDuplicateIcon className={'w-3 text-gray-500'}/>
                    </div>

                </div>

                {/* Actions: Add wallet + Network switch */}
                <div className="w-full">
                    <Link
                        to="/"
                        className="block text-end font-bold text-blue-600  px-4 "
                    >
                        StellarHub
                    </Link>

                    {/* Network switch dropdown */}
                    <div className="grid grid-auto-rows w-full justify-end-safe">
                        <Sidebar position="top" visible={visibleNetwork} onHide={() => setVisibleNetwork(false)}
                                 className={'px-4 text-center'}
                                 header={<div className={'text-center mt-3'}>Select Network</div>}
                        >
                            <div
                                className=" mt-0 w-full ">
                                <div
                                    onClick={() => handleSwitchNetwork("public")}
                                    className={`px-3 py-2 text-gray-600 cursor-pointer text-xs ${
                                        network === "public" && "text-sky-700"
                                    }`}
                                >
                                    Public
                                </div>
                                <div
                                    onClick={() => handleSwitchNetwork("testnet")}
                                    className={`px-3 py-2 text-gray-600 cursor-pointer text-xs ${
                                        network === "testnet" && "text-sky-700"
                                    }`}
                                >
                                    Testnet
                                </div>
                            </div>
                        </Sidebar>
                        <div onClick={() => setVisibleNetwork(true)}
                             className={" w-full flex text-xs pr-3  text-sky-600 "}>
                            <span className={'grow'}>
                            {network === "public" ? "Public network" : "Test network"}
                            </span>
                            <ChevronDownIcon className={'flex-none w-4 '} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
