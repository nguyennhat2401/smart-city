import { useRoutes } from "react-router-dom";
import {router} from "../../Router/index"

function AllRouter(){

    const element = useRoutes(router)
    return(
        <>
            {element}
        </>
    )
}
export default AllRouter;