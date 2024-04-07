import { Stack } from "@mantine/core";
import { ComingSoon } from "./ComingSoon";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

function App() {
    return (
        <Stack>
            <Header />
            <ComingSoon />
            <Footer />
        </Stack>
    );
}

export default App;
