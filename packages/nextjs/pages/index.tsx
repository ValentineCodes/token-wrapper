import React, {useState} from "react"
import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import BridgeForm from "~~/components/BridgeForm";
import WithdrawForm from "~~/components/WithdrawForm";

const Home: NextPage = () => {
  const [isBridging, setIsBridging] = useState(true)

  return (
    <>
      <Head>
        <title>Token Wrapper</title>
        <meta name="description" content="Wrap Layer-1 and Layer-2 tokens" />
      </Head>

      <main className="flex justify-center items-center p-4 m-auto">
        
        <section className="bg-white text-black p-8 rounded-md shadow-md">
          <h1 className='mb-10 text-2xl'>
            {isBridging? "Bridge" : "Withdraw"} 
            <span 
              className='text-sm text-[#624DE3] cursor-pointer hover:font-bold ml-1' 
              onClick={() => setIsBridging(!isBridging)}>
              {isBridging? "Withdraw" : "Bridge"}
            </span>
          </h1>

          <form>
            {isBridging? <BridgeForm /> : <WithdrawForm /> }
          </form>
        </section>
        
      </main>
    </>
  );
};

export default Home;
