import { Metadata } from "next";


import DefaultLayout from "@/components/Layouts/DefaultLaout";
import DashboardAdvCamaping from "@/components/Dashboard/DashboardAdvCampaing";


export const metadata: Metadata = {
  title: "Next.js CRM Dashboard | DashboardSuppliers",
  description: "Página de DashboardSuppliers",
};

const DashboardCampaingPage = () => (
  <DefaultLayout>
  <DashboardAdvCamaping/>
  </DefaultLayout>
);

export default DashboardCampaingPage;