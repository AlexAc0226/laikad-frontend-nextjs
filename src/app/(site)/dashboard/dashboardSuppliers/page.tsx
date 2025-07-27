import { Metadata } from "next";

import DashboardSuppliers from "@/components/Dashboard/DashboardSuppliers";
import DefaultLayout from "@/components/Layouts/DefaultLaout";

export const metadata: Metadata = {
  title: "Next.js CRM Dashboard | DashboardSuppliers",
  description: "Página de DashboardSuppliers",
};

const DashboardSuppliersPage = () => (
  <DefaultLayout>
    <DashboardSuppliers />
  </DefaultLayout>
);

export default DashboardSuppliersPage;