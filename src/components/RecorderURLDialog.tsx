import { sendMessageToServiceWorker } from "@/ts/api/CrxApi";
import { CRX_COMMAND } from "@/ts/constants/CrxConstants";
import { useAppDispatch, useAppSelector } from "@/ts/hooks"
import { getIsOpenRecorderURLDialog, setIsOpenRecorderURLDialog } from "@/ts/reducers/dialog"
import { Box, Button, Dialog, InputLabel, TextField } from "@mui/material"
import { useState } from "react";

export default () => {
    const dispatch = useAppDispatch();
    const [url, setUrl] = useState('');
    const isOpen = useAppSelector(getIsOpenRecorderURLDialog);
    const startRecorder = () => {
        sendMessageToServiceWorker(CRX_COMMAND.CMD_LAUNCH_BROWSER_RECORDER, {url : url})
    }
    return (
        <Dialog open={isOpen}
        onClose={() => dispatch(setIsOpenRecorderURLDialog(false))}
        >
            <Box height={100} padding={1}>
                <InputLabel htmlFor="url">URL</InputLabel>
                <TextField onChange={(e) => setUrl(e.target.value)} id="url" size="small"></TextField>
                <Button onClick={startRecorder} fullWidth>시작</Button>
            </Box>
        </Dialog>
    )
}