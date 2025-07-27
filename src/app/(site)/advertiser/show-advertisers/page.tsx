import { Metadata } from "next";
import ShowAdvertiser from "@/components/Advertisers/ShowAdvertiser";
import DefaultLayout from "@/components/Layouts/DefaultLaout";


const ShowAdvertisersPage = () => {
  return (
    <DefaultLayout>
      <ShowAdvertiser />
    </DefaultLayout>
  );
};

export default ShowAdvertisersPage;