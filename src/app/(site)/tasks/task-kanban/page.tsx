import React from "react";
import TaskKanban from "@/components/Tasks/TaskKanban";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TaskHeader from "@/components/Tasks/TaskHeader";

export const metadata: Metadata = {
  title: "Next.js Task Kanban Page | NextAdmin - Next.js Dashboard Kit",
  description: "This is Next.js Task Kanban page for NextAdmin Dashboard Kit",
  // other metadata
};

const TaskKanbanPage = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl">
        <Breadcrumb pageName="Task Kanban" />

        <TaskHeader />
        <TaskKanban />
      </div>
    </DefaultLayout>
  );
};

export default TaskKanbanPage;
