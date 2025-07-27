import { Metadata } from "next";

import DefaultLayout from "@/components/Layouts/DefaultLaout";
import ShowAjust from "@/components/Reports/Adjust Report/Ajust";

const ShowAjustPage = () => {
  return (
    <DefaultLayout>
      <ShowAjust />
    </DefaultLayout>
  );
};

export default ShowAjustPage;