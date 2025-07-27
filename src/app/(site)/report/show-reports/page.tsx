import { Metadata } from "next";
import ShowReports from "@/components/Reports/Report/ShowReport";
import DefaultLayout from "@/components/Layouts/DefaultLaout";

const ShowReportsPage = () => {
  return (
    <DefaultLayout>
      <ShowReports />
    </DefaultLayout>
  );
};

export default ShowReportsPage;