import { createTheme, MantineProvider } from "@mantine/core";
import { FC, ReactNode } from "react";

export const theme = createTheme({
    /* Put your mantine theme override here */
});

export const StyleProvider: FC<{ children: ReactNode[] | ReactNode }> = ({
    children,
}) => {
    return <MantineProvider theme={theme}>{children}</MantineProvider>;
};
