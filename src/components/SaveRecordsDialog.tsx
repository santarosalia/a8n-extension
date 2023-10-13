import { sendMessageToServiceWorker } from "@/ts/api/CrxApi";
import { CRX_COMMAND } from "@/ts/constants/CrxConstants";
import { useAppDispatch, useAppSelector } from "@/ts/hooks"
import { getIsOpenSaveRecordsDialog, setIsOpenSaveRecordsDialog } from "@/ts/reducers/dialog"
import { Box, Button, Dialog, InputLabel, TextField } from "@mui/material"
import { useState } from "react";

export default () => {
    const dispatch = useAppDispatch();
    const [processName, setProcessName] = useState('');
    const isOpen = useAppSelector(getIsOpenSaveRecordsDialog);
    const saveRecords = () => {
        sendMessageToServiceWorker(CRX_COMMAND.CMD_RECORDING_END, {name : processName})
    }
    return (
        <Dialog
        open={isOpen}
        onClose={() => dispatch(setIsOpenSaveRecordsDialog(false))}
        >
            <Box height={100} padding={1}>
                <InputLabel htmlFor="processName">프로세스 명</InputLabel>
                <TextField onChange={(e) => setProcessName(e.target.value)} id="processName" size="small"></TextField>
                <Button onClick={saveRecords} fullWidth>저장</Button>
            </Box>
        </Dialog>
    )
}