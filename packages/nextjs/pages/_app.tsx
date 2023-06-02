import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, lightTheme, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  braveWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import * as chains from "wagmi/chains";
import { ChakraBaseProvider, extendBaseTheme } from '@chakra-ui/react'
import chakraTheme from '@chakra-ui/theme'
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import scaffoldConfig from "~~/scaffold.config";
import { burnerWalletConfig } from "~~/services/web3/wagmi-burner/burnerWalletConfig";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
// import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
// import { useGlobalState } from "~~/services/store/store";
// import { wagmiClient } from "~~/services/web3/wagmiClient";
// import { appChains } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";

const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  // const price = useNativeCurrencyPrice();
  // const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
  // This variable is required for initial client side rendering of correct theme for RainbowKit
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { isDarkMode } = useDarkMode();

  const { Input, Modal, NumberInput, Select, Spinner } = chakraTheme.components

  const theme = extendBaseTheme({
    components: {
      Input,
      Modal,
      NumberInput,
      Select,
      Spinner,
    },
  })

  const configuredNetwork = getTargetNetwork();
const burnerConfig = scaffoldConfig.burnerWallet;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const enabledChains =
  (configuredNetwork.id as number) === 1 ? [configuredNetwork] : [configuredNetwork, chains.mainnet];

/**
 * Chains for the app
 */
 const appChains = configureChains(
  enabledChains,
  [
    alchemyProvider({
      apiKey: scaffoldConfig.alchemyApiKey,
      priority: 0,
    }),
    publicProvider({ priority: 1 }),
  ],
  {
    stallTimeout: 3_000,
    // Sets pollingInterval if using chain's other than local hardhat chain
    ...(configuredNetwork.id !== chains.hardhat.id
      ? {
          pollingInterval: scaffoldConfig.pollingInterval,
        }
      : {}),
  },
);

const wallets = [
  metaMaskWallet({ chains: appChains.chains, shimDisconnect: true }),
  walletConnectWallet({ chains: appChains.chains }),
  ledgerWallet({ chains: appChains.chains }),
  braveWallet({ chains: appChains.chains }),
  coinbaseWallet({ appName: "scaffold-eth-2", chains: appChains.chains }),
  rainbowWallet({ chains: appChains.chains }),
];

/**
 * wagmi connectors for the wagmi context
 */
 const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets: burnerConfig.enabled ? [...wallets, burnerWalletConfig({ chains: [appChains.chains[0]] })] : wallets,
  },
]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors: wagmiConnectors,
  provider: appChains.provider,
});

  // useEffect(() => {
  //   if (price > 0) {
  //     setNativeCurrencyPrice(price);
  //   }
  // }, [setNativeCurrencyPrice, price]);

  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  return (
    <WagmiConfig client={wagmiClient}>
      <NextNProgress />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={isDarkTheme ? darkTheme() : lightTheme()}
      >
        <div className="flex flex-col min-h-screen">
          <Header />

          <ChakraBaseProvider theme={theme}>
            <main className="relative flex flex-col flex-1">
              <Component {...pageProps} />
            </main>
          </ChakraBaseProvider>

          <Footer />
        </div>
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
