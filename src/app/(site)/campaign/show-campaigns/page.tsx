import { Metadata } from "next";
import ShowCampaigns from "@/components/Campaigns/ShowCampaignsr";
import DefaultLayout from "@/components/Layouts/DefaultLaout";


const ShowCampaignsPage = () => {
  return (
    <DefaultLayout>
      <ShowCampaigns />
    </DefaultLayout>
  );
};

export default ShowCampaignsPage;