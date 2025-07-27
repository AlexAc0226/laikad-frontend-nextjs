import { Metadata } from "next";
import ShowRotador from "@/components/Reports/Rotador/ShowRotador";
import DefaultLayout from "@/components/Layouts/DefaultLaout";

const ShowRotadorPage = () => {
  return (
    <DefaultLayout>
      <ShowRotador />
    </DefaultLayout>
  );
};

export default ShowRotadorPage;