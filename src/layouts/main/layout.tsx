import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <>
      <Helmet>
        <title>Unowned</title>
      </Helmet>

      <Outlet />
    </>
  );
}