import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import BridgeForm from "~~/components/BridgeForm";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Token Wrapper</title>
        <meta name="description" content="Wrap Layer-1 and Layer-2 tokens" />
      </Head>

      <main className="flex justify-center items-center p-4 mx-auto">
        <BridgeForm />
      </main>
    </>
  );
};

export default Home;
