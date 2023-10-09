import { setProcessId } from "@/ts/reducers/process"
import { MenuItem, Select } from "@mui/material"
import { store } from "@/ts/store"
import { useEffect, useState } from "react"
import { axios } from "@/ts/api/Axios"
export default () => {
    
    const [process, setProcess] = useState('');
    const [processesData, setProcessesData] = useState([]);
    const setId = (e) => {
        setProcess(e.target.value)
        store.dispatch(setProcessId(e.target.value));
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
            <MenuItem value={v.id} key={i}>
                {v.name}
            </MenuItem>
        )
    })
    return (
        <Select
            size="small"
            value={process}
            displayEmpty
            onChange={e => setId(e)}
        >
            <MenuItem value=''>Select Process</MenuItem>
            {processes}
        </Select>
    )
}