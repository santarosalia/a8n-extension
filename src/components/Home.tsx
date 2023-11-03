import { Box, Button } from "@mui/material"
import ProcessSelect from "./ProcessSelect"
import BottomNavigation from "./BottomNavigation"
import { useAppDispatch } from "@/ts/hooks";
import Header from "./Header";
import RecorderURLDialog from "./RecorderURLDialog";
import SaveRecordsDialog from "./SaveRecordsDialog";

export default () => {
    return (
        <>
            <Header/>
            <Box height={200} marginTop={'40px'}>
                <Box>
                    <ProcessSelect/>
                </Box>
            </Box>
            <BottomNavigation/>
            <RecorderURLDialog/>
            <SaveRecordsDialog/>
        </>
    )
}