import { Metadata } from "next";
import TestLinkOffer from "@/components/TestLinkOffer/TestLink";
import DefaultLayout from "@/components/Layouts/DefaultLaout";


const TestLinkOfferPage = () => {
  return (
    <DefaultLayout>
      <TestLinkOffer />
    </DefaultLayout>
  );
};

export default TestLinkOfferPage;