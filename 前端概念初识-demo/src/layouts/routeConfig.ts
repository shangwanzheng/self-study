import type { ComponentType } from 'react';
import EmployeePage from '@/pages/employee';

export interface AppRoute {
  path: string;
  title: string;
  component: ComponentType;
}

/** 路由集中在这里。没有被点名要改的，不动。 */
export const routeConfig: AppRoute[] = [
  { path: '/employee', title: '员工', component: EmployeePage },
];
