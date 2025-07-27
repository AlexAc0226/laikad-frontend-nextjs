import { Metadata } from "next";
import AppsflyerReport from "@/components/Reports/appsflyer/AppsflyerReport";
import DefaultLayout from "@/components/Layouts/DefaultLaout";

const AppsflyerReportPage = () => {
  return (
    <DefaultLayout>
      <AppsflyerReport />
    </DefaultLayout>
  );
};

export default AppsflyerReportPage;