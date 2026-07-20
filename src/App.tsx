import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { queryClient } from '@/lib/query-client';
import { AppRouting } from '@/routing/app-routing';
import { I18nProvider } from "@/lib/i18n";
import { QueryClientProvider } from '@tanstack/react-query';

const { BASE_URL } = import.meta.env;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <LoadingBarContainer>
          <I18nProvider>
            <BrowserRouter basename={BASE_URL}>
              <AppRouting />
            </BrowserRouter>
          </I18nProvider>
        </LoadingBarContainer>
      </HelmetProvider>
    </QueryClientProvider>
  )
}

export default App
