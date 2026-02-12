import { Metadata } from "next";

import DefaultLayout from "@/components/Layouts/DefaultLaout";
import ShowAdjustment from "@/components/Reports/AdjustmentReport/Adjustment";


const ShowAdjustmentPage = () => (
  <DefaultLayout>
    <ShowAdjustment />
  </DefaultLayout>
);

export default ShowAdjustmentPage;