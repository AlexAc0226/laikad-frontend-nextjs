'use client';
import React from 'react';

import ChartOne from '@/components/Charts/ChartOne';
import DataStatsOne from '@/components/DataStats/DataStatsOne';
import ChartThree from '../Charts/ChartThree';
import ChartTwo from '../Charts/ChartTwo';
import ChatCard from '../Chat/ChatCard';
import MapOne from '../Maps/MapOne';
import TableOne from '../Tables/TableOne';
import FiltersDashboard from '../DataStats/FiltersDashboard';
import ProtectedLayout from '../Auth/ProtectedLayout';

const ECommerce: React.FC = () => {
  return (
    <>
   <ProtectedLayout> 
      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <FiltersDashboard />
        </div>
      </div>
      {
        localStorage.getItem('RoleID') === '9' || localStorage.getItem('RoleID') === '3' ? (
          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
            <ChartOne />
            <ChartTwo />
            <ChartThree />
            <MapOne />
            <div className="col-span-12 xl:col-span-8">
              <TableOne />
            </div>
            <ChatCard />
          </div>
        ) : (
          ""
        )
      }
      </ProtectedLayout>
    </>
  );
};

export default ECommerce;

