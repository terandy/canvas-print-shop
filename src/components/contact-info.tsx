import { EMAIL, PHONE, OPENING_HOURS } from "@/lib/constants";
import clsx from "clsx";

interface Props {
    className?: string;
}

const ContactInfo: React.FC<Props> = ({ className }) => {
    return <p className={clsx("text-gray-600", className)}>
        Email: {EMAIL.label}<br />
        Phone: {PHONE.label}<br />
        Hours: {OPENING_HOURS}<br />
    </p>
}

export default ContactInfo;