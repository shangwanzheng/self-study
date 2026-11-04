import { request } from '@/utils/request';

export interface Employee {
  id: string;
  name: string;
  age: number;
  active: boolean;
  tags: string[];
  status: '在职' | '离职';
  dept?: string | null;
}

export function fetchEmployees() {
  return request<Employee[]>({ url: '/employees', method: 'GET' });
}

export function createEmployee(payload: Omit<Employee, 'id'>) {
  return request<Employee>({ url: '/employees', method: 'POST', data: payload });
}

export function removeEmployee(id: string) {
  return request<boolean>({ url: `/employees/${id}`, method: 'DELETE' });
}

export function fetchFailExample() {
  return request<null>({ url: '/fail', method: 'GET' });
}
