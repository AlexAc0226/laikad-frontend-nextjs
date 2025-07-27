import { Metadata } from "next";


import DefaultLayout from "@/components/Layouts/DefaultLaout";
import DashboardAdvertiser from "@/components/Dashboard/DashboardAdvertiser";

export const metadata: Metadata = {
  title: "Next.js CRM Dashboard | DashboardSuppliers",
  description: "Página de DashboardSuppliers",
};

const DashboardCampaingPage = () => (
  <DefaultLayout>
  <DashboardAdvertiser/>
  </DefaultLayout>
);

export default DashboardCampaingPage;