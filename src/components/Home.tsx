import { Box, Button } from "@mui/material"
import ProcessSelect from "./ProcessSelect"
import BottomNavigation from "./BottomNavigation"
import { useAppDispatch } from "@/ts/hooks";
import { setIsSignin, setUser } from "@/ts/reducers/user";
import Header from "./Header";
import RecorderURLDialog from "./RecorderURLDialog";
import SaveRecordsDialog from "./SaveRecordsDialog";

export default () => {
    const dispatch = useAppDispatch();
    return (
        <>
            <Header/>
            <Box height={200} marginTop={'40px'}>
                <Box width={'80%'} margin={'auto'}>
                    <ProcessSelect/>
                </Box>
                
                <Button onClick={() => {
                    dispatch(setUser(null));
                    dispatch(setIsSignin(false));
                }}>
                    logout
                </Button>
            </Box>
            <BottomNavigation/>
            <RecorderURLDialog/>
            <SaveRecordsDialog/>
        </>
    )
}