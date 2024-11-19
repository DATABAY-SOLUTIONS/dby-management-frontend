import React from 'react';
import { Card, Skeleton } from 'antd';

export const ProjectCardSkeleton: React.FC = () => (
  <Card className="w-full">
    <Skeleton active paragraph={{ rows: 3 }} />
  </Card>
);

export const ProjectDetailsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Card>
      <Skeleton active paragraph={{ rows: 2 }} />
      <div className="h-[300px] bg-gray-100 rounded-lg mt-6" />
    </Card>
    
    <Card>
      <Skeleton active paragraph={{ rows: 4 }} />
    </Card>
  </div>
);

export const TimelineEntrySkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    <div className="flex gap-3">
      <Skeleton.Avatar active size="small" />
      <div className="flex-1">
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex justify-between mb-4">
      <Skeleton.Input style={{ width: 150 }} active />
      <Skeleton.Button active />
    </div>
    
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="mb-2">
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    ))}
  </div>
);