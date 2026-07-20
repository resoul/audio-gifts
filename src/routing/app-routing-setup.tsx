import { Navigate, Route, Routes } from 'react-router';
import { ErrorRouting } from '@/errors/error-routing';
import { MainLayout } from '@/layouts/main/layout';
import { IndexRoute } from "@/pages";
import { ChooseSongPage } from "@/pages/choose-song";
import { ContactPage } from "@/pages/contact";
import { CreateCustomTrackPage } from "@/pages/create-custom-track";
import { LegalPage } from "@/pages/legal";

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