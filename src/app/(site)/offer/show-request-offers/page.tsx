import { Metadata } from "next";
import ShowRequestOffers from "@/components/Offers/RequestOffers/ShowRequestOffers";
import DefaultLayout from "@/components/Layouts/DefaultLaout";


const ShowRequestOffersPage = () => {
  return (
    <DefaultLayout>
      <ShowRequestOffers />
    </DefaultLayout>
  );
};

export default ShowRequestOffersPage;