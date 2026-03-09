import { useAppSelector } from "../../../hooks"
import { getDetailDepot } from "../slice/depot.slice"
import DepotDetailWithLinks from "./depotDetail/DepotDetailWithLinks"
import DepotEditor from "./depotEditor/DepotEditor"
import DepotList from "./depotList/DepotList"

function DepotComponent() {
    const showDetail = useAppSelector(getDetailDepot)

    return (
    <>
        <DepotEditor />
        {showDetail ? <DepotDetailWithLinks /> : <DepotList /> }
    </>)
}

export default DepotComponent