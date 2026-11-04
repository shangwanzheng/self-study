import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/layouts/AppRoutes';
import { EmployeeStoreProvider } from '@/store/employee';
import { GlobalStoreProvider } from '@/store/global';
import 'antd/dist/reset.css';
import './global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('缺少 #root');
}

createRoot(root).render(
  <ConfigProvider locale={zhCN}>
    <GlobalStoreProvider>
      <EmployeeStoreProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </EmployeeStoreProvider>
    </GlobalStoreProvider>
  </ConfigProvider>,
);
