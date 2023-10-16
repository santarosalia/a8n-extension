export const getMaxProcessCount = (level: number) => {
    switch (level) {
        case 0 : return 5;
        case 1 : return 100;
        case 2 : return 500;
        default : return 0;
    }
}