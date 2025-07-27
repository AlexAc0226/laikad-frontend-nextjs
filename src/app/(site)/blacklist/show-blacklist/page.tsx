import { Metadata } from "next";
import ShowBlacklist from "@/components/Blacklist/ShowBlacklist";
import DefaultLayout from "@/components/Layouts/DefaultLaout";


const ShowBlacklistPage = () => {
  return (
    <DefaultLayout>
      <ShowBlacklist />
    </DefaultLayout>
  );
};

export default ShowBlacklistPage;