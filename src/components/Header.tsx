import { openWindow } from "@/ts/api/CrxApi";
import { AppBar, Box } from "@mui/material"

export default () => {
    const imageURL = chrome.runtime.getURL('/rgb.gif');
    const goHome = () => {
        openWindow(import.meta.env.VITE_HOME);
    }
    return (
        <AppBar sx={{backgroundColor : 'black', height : '30px'}}>
            <Box onClick={goHome} margin={'auto'}>
                <img src={imageURL} width={'30px'} height={'30px'}/>
            </Box>
        </AppBar>
    )
}