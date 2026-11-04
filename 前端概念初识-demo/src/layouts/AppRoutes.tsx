import { Navigate, Route, Routes } from 'react-router-dom';
import { routeConfig } from './routeConfig';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/employee" replace />} />
      {routeConfig.map((item) => {
        const Page = item.component;
        return <Route key={item.path} path={item.path} element={<Page />} />;
      })}
    </Routes>
  );
}
