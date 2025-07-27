import { Metadata } from "next";
import ShowPublishers from "@/components/Publishers/ShowPublisher";
import DefaultLayout from "@/components/Layouts/DefaultLaout";


const ShowPublishersPage = () => {
  return (
    <DefaultLayout>
      <ShowPublishers />
    </DefaultLayout>
  );
};

export default ShowPublishersPage;