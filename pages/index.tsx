import type { NextPage } from "next";
import dynamic from "next/dynamic";

const SSEContext = dynamic(
  () => import("./components/SSEProvider/SSEProvider")
);

const Home: NextPage = () => {
  return (
    <SSEContext>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </SSEContext>
  );
};

export default Home;
