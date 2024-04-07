import "@mantine/carousel/styles.css";
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";

import App from "./App.tsx";
import { config } from "./wagmi.ts";

import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <MantineProvider>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </WagmiProvider>
        </MantineProvider>
    </React.StrictMode>,
);
