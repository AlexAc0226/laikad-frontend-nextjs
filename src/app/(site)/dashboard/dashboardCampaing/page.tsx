import { Metadata } from "next";


import DefaultLayout from "@/components/Layouts/DefaultLaout";
import DashboardSuppliers from "@/components/Dashboard/DashboardSuppliersCampaing";

export const metadata: Metadata = {
  title: "Next.js CRM Dashboard | DashboardSuppliers",
  description: "Página de DashboardSuppliers",
};

const DashboardCampaingPage = () => (
  <DefaultLayout>
  <DashboardSuppliers/>
  </DefaultLayout>
);

export default DashboardCampaingPage;