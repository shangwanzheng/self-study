import { useState } from 'react';
import { createStore } from 'hox';

function useGlobalState() {
  const [userName, setUserName] = useState('演示用户');
  return { userName, setUserName };
}

/** 全站共用的状态。页面里只调用 useGlobalStore。 */
export const [useGlobalStore, GlobalStoreProvider] = createStore(useGlobalState);
