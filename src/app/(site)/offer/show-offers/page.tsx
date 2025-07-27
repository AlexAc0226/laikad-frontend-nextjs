import { Metadata } from "next";
import ShowOffers from "@/components/Offers/Offers/ShowOffer";
import DefaultLayout from "@/components/Layouts/DefaultLaout";


const ShowOffersPage = () => {
  return (
    <DefaultLayout>
      <ShowOffers />
    </DefaultLayout>
  );
};

export default ShowOffersPage;