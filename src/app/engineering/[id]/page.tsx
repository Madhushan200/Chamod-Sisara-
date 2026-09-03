import React from 'react';
import EngineeringOrderDetailClient from './EngineeringOrderDetailClient';

export function generateStaticParams() {
  return [
    { id: 'WO-101' },
    { id: 'WO-102' },
    { id: 'WO-103' },
    { id: 'WO-104' },
    { id: 'default' },
  ];
}

export default function Page() {
  return <EngineeringOrderDetailClient />;
}
