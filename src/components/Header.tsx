import { AppBar, Box } from "@mui/material"

export default () => {
    const imageURL = chrome.runtime.getURL('/rgb.gif');
    
    return (
        <AppBar sx={{backgroundColor : 'black', height : '30px'}}>
            <Box margin={'auto'}>
                <img src={imageURL} width={'30px'} height={'30px'}/>
            </Box>
        </AppBar>
    )
}