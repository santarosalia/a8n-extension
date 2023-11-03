import { Box, CircularProgress } from "@mui/material"

export default () => {
    return (
        <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={200}>
            <CircularProgress/>
        </Box>
    )
}