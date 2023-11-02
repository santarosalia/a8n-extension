import { Box, Button } from "@mui/material"
import { openWindow } from "@/ts/api/CrxApi";
export default () => {
    const goSignIn = () => {
        openWindow(import.meta.env.VITE_HOME + '/signin');
    }
    const goSignUp = () => {
        openWindow(import.meta.env.VITE_HOME + '/signup');
    }

    return (
        <Box>
            <Button onClick={goSignIn} fullWidth variant="contained" sx={{my: 1}}>로그인</Button>
            <Button onClick={goSignUp} fullWidth variant="contained" sx={{my: 1}}>계정 생성</Button>
        </Box>
    )
}