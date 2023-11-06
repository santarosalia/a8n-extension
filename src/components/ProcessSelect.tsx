import { getProcessId, getProcesses, setProcessId, setProcesses } from "@/ts/reducers/process"
import { Divider, List, ListItem, ListItemButton, MenuItem, Select } from "@mui/material"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/ts/hooks"
import ProcessItemButton from "./ProcessItemButton"
import { fetchProcesses } from "@/ts/api/Fetch"
export default () => {
    const dispatch = useAppDispatch();
    const processes = useAppSelector(getProcesses);
    
    const setId = (id: string) => {
        dispatch(setProcessId(id));
    }
    useEffect(() => {
        fetchProcesses().then(result => {
            dispatch(setProcesses(result));
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