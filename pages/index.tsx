import type { NextPage } from "next";
import { getCookie, setCookie } from "cookies-next";
import { createSessionCookie } from "../lib/utils/api";
import { NextApiRequest, NextApiResponse } from "next";
import CSRFProvider from "../components/CSRFProvider/CSRFProvider";

export const getServerSideProps = async ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  if (!getCookie("id", { req })) {
    // Expire cookie in 12 hours
    const { id, ...settings } = createSessionCookie();
    setCookie("id", id, {
      req,
      res,
      ...settings,
    });
  }

  return { props: {} };
};

const Home: NextPage = () => {
  return (
    <CSRFProvider>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </CSRFProvider>
  );
};

export default Home;
