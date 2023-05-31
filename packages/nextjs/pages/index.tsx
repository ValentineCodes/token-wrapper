import React, {useState} from "react"
import Head from "next/head";
import type { NextPage } from "next";
import WrapForm from "~~/components/forms/wrap/WrapForm";

const Home: NextPage = () => {
  const [isWrap, setIsWrap] = useState(true)

  return (
    <>
      <Head>
        <title>Token Wrapper</title>
        <meta name="description" content="Wrap tokens" />
      </Head>

      <main className="flex justify-center items-center p-4 m-auto">
        
        <section className="bg-white text-black p-8 rounded-md shadow-md">
          <h1 className='mb-10 text-2xl'>
            {isWrap? "Wrap" : "Unwrap"} 
            <span 
              className='text-sm text-[#624DE3] cursor-pointer hover:font-bold ml-1' 
              onClick={() => setIsWrap(!isWrap)}>
              {isWrap? "Unwrap" : "Wrap"}
            </span>
          </h1>

          <form onSubmit={e => e.preventDefault()}>
            {isWrap && <WrapForm />}
          </form>
        </section>
        
      </main>
    </>
  );
};

export default Home;
