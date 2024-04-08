import { Flex, Image, Stack, Text } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { FC } from "react";
import Typist from "react-typist-component";

import logo from "../img/knight.png";

export const ComingSoon: FC = () => {
    const { height } = useViewportSize();
    return (
        <Stack h={height - 80} align="center" justify="center">
            <Flex align="baseline">
                <Image src={logo} w={300} h={300} bg="red" />
                <Typist>
                    <Typist.Delay ms={500} />
                    <Text ff="Cardo" fz={96} c="#273053">
                        OnChain Chess
                    </Text>
                    <Typist.Delay ms={800} />
                    <Typist.Backspace count={9} />
                    <Text ff="Cardo" fz={96} c="#273053">
                        ess
                    </Text>
                    <Typist.Delay ms={800} />
                    <Text>(coming soon)</Text>
                </Typist>
            </Flex>
        </Stack>
    );
};
