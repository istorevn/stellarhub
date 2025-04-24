import {
    ArrowsRightLeftIcon,
    PlusCircleIcon,
    TrashIcon,
    CurrencyDollarIcon,
    UserPlusIcon,
    XCircleIcon,
    ArrowDownLeftIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export function getTxIcon(type) {
    switch (type) {
        case "payment":
            return ArrowDownLeftIcon;
        case "create_account":
            return UserPlusIcon;
        case "account_merge":
            return TrashIcon;
        case "path_payment_strict_send":
            return ArrowsRightLeftIcon;
        case "change_trust":
            return PlusCircleIcon;
        default:
            return XCircleIcon;
    }
}

export function transactionFailed(){
    return ExclamationTriangleIcon;
}

