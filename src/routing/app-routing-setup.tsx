import { Navigate, Route, Routes } from 'react-router';
import { MainLayout } from '@/layouts/main/layout';
import { lazy } from "react";

const ErrorRouting = lazy(() => import("@/errors/error-routing"))
const ChooseSongPage = lazy(() => import("@/pages/choose-song"))
const ContactPage = lazy(() => import("@/pages/contact"))
const LegalPage = lazy(() => import("@/pages/legal"))
const CreateCustomTrackPage = lazy(() => import("@/pages/create-custom-track"))
const IndexRoute = lazy(() => import("@/pages"))

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<IndexRoute />} />
        <Route path="/choose-song" element={<ChooseSongPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/create-custom-track" element={<CreateCustomTrackPage />} />
        <Route path="/legal" element={<LegalPage />} />
      </Route>
      <Route path="error/*" element={<ErrorRouting />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
}