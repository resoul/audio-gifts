import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

export function ErrorLayout() {
  return (
    <>
      <Helmet>
        <title>Unowned</title>
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Outlet />
      </div>
    </>
  );
}