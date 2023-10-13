import { useAppDispatch, useAppSelector } from "@/ts/hooks"
import { getIsOpenSnackbar, getSnackbarMessage, setIsOpenSnackbar } from "@/ts/reducers/dialog"
import { Slide, Snackbar } from "@mui/material"

export default () => {
    const dispatch = useAppDispatch();
    const isOpenSnackbar = useAppSelector(getIsOpenSnackbar);
    const snackbarMessage = useAppSelector(getSnackbarMessage);
    return (
        <Snackbar
        open={isOpenSnackbar}
        autoHideDuration={3000}
        onClose={() => dispatch(setIsOpenSnackbar(false))}
        TransitionComponent={Slide}
        message={snackbarMessage}
        />
    )
}