
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import DashboardRequestOff from "@/components/Dashboard/DashboardRequestOff";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js CRM Dashboard | DashboardSuppliers",
  description: "Página de DashboardSuppliers",
};

const DashboardRequestOffPage = () => (
  <DefaultLayout>
  <DashboardRequestOff/>
  </DefaultLayout>
);

export default DashboardRequestOffPage;