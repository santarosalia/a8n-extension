import { getProcessId, getProcesses, setProcessId, setProcesses } from "@/ts/reducers/process"
import { Divider, List, ListItem, ListItemButton, MenuItem, Select } from "@mui/material"
import { useEffect, useState } from "react"
import { axios } from "@/ts/api/Axios"
import { useAppDispatch, useAppSelector } from "@/ts/hooks"
import { getUser } from "@/ts/reducers/user"
import ProcessItemButton from "./ProcessItemButton"
export default () => {
    const dispatch = useAppDispatch();
    const processId = useAppSelector(getProcessId);
    const processes = useAppSelector(getProcesses);
    const user = useAppSelector(getUser);
    
    const setId = (id: string) => {
        dispatch(setProcessId(id));
    }
    useEffect(() => {
        axios.get(`/api/process`).then(result => {
            dispatch(setProcesses(result.data));
        });
    }, []);
    const processMenuItems = processes.map((v, i) =>{
        return (
            <>
            <ListItem key={i} dense>
                <ProcessItemButton value={v.id} onClick={setId}>
                    {v.name}
                </ProcessItemButton>
            </ListItem>
            <Divider variant="middle"/>
            </>
        )
    });
    return (
        <List>
            {processMenuItems}
        </List>
    )
}