import { useState } from 'react';
import { createStore } from 'hox';

function useEmployeeState() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return { selectedId, setSelectedId };
}

/** 这个功能里多个组件共用的状态。 */
export const [useEmployeeStore, EmployeeStoreProvider] = createStore(useEmployeeState);
