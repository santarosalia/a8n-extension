import { useAppDispatch, useAppSelector } from "@/ts/hooks"
import { getProcessId } from "@/ts/reducers/process"
import { ListItemButton } from "@mui/material"

export default ({value, onClick, children}: {
    value?: string,
    onClick?: Function,
    children?: any
}) => {
    const processId = useAppSelector(getProcessId);
    return (
        <ListItemButton selected={processId === value} onClick={() => onClick(value)}>
            {children}
        </ListItemButton>
    )
}