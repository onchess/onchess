import { AppShell, Stack } from "@mantine/core";
import { ComingSoon } from "./components/ComingSoon";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

function App() {
    return (
        <AppShell header={{ height: 40 }} footer={{ height: 40 }}>
            <AppShell.Header withBorder={false}>
                <Header />
            </AppShell.Header>
            <AppShell.Main>
                <Stack gap={0}>
                    <ComingSoon />
                </Stack>
            </AppShell.Main>
            <AppShell.Footer withBorder={false}>
                <Footer />
            </AppShell.Footer>
        </AppShell>
    );
}

export default App;
