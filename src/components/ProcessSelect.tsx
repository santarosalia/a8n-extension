import { getProcessId, setProcessId } from "@/ts/reducers/process"
import { MenuItem, Select } from "@mui/material"
import { useEffect, useState } from "react"
import { axios } from "@/ts/api/Axios"
import { useAppDispatch, useAppSelector } from "@/ts/hooks"
export default () => {
    const dispatch = useAppDispatch();
    const processId = useAppSelector(getProcessId);
    const [processesData, setProcessesData] = useState([]);
    const setId = (e) => {
        dispatch(setProcessId(e.target.value));
    }
    useEffect(() => {
        chrome.storage.local.get('user').then(result => {
            axios.get(`/api/process/${result.user.id}`).then(result => {
                setProcessesData(result.data);
            });
        });
    }, []);
    const processes = processesData.map((v, i) =>{
        return (
            <MenuItem
                value={v.id}
                key={i}
                dense
            >
                {v.name}
            </MenuItem>
        )
    })
    return (
        <Select
            size="small"
            value={processId}
            displayEmpty
            onChange={e => setId(e)}
            fullWidth
        >
            <MenuItem value='' dense>Select Process</MenuItem>
            {processes}
        </Select>
    )
}