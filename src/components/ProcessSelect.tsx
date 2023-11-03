import { getProcessId, getProcesses, setProcessId, setProcesses } from "@/ts/reducers/process"
import { MenuItem, Select } from "@mui/material"
import { useEffect, useState } from "react"
import { axios } from "@/ts/api/Axios"
import { useAppDispatch, useAppSelector } from "@/ts/hooks"
import { getUser } from "@/ts/reducers/user"
export default () => {
    const dispatch = useAppDispatch();
    const processId = useAppSelector(getProcessId);
    const processes = useAppSelector(getProcesses);
    const user = useAppSelector(getUser);
    
    const setId = (e) => {
        dispatch(setProcessId(e.target.value));
    }
    useEffect(() => {
        axios.get(`/api/process/${user.id}`).then(result => {
            dispatch(setProcesses(result.data));
        });
    }, []);
    const processMenuItems = processes.map((v, i) =>{
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
            {processMenuItems}
        </Select>
    )
}