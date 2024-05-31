import useRole from "../../../hooks/useRole";
import AdminStatistics from "../Admin/AdminStatistics";
import GuestStatistics from "../Guest/GuestStatistics";
import HostStatistics from "../Host/HostStatistics";

const Statistics = () => {
    const {role} = useRole();
    console.log(role)
    return (
        <div>
            {role === "Admin" && <AdminStatistics/>}
            {role === "Host" && <HostStatistics/>}
            {role === "Guest" && <GuestStatistics/>}
        </div>
    );
};

export default Statistics;