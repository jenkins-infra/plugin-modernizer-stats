import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Layout from './components/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const PluginList = lazy(() => import('./pages/PluginList'));
const PluginDetail = lazy(() => import('./pages/PluginDetail'));
const RecipeList = lazy(() => import('./pages/RecipeList'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const BASE = import.meta.env.BASE_URL;

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <Layout>
      {/* keyed on the path so a render error on one page doesn't stick after navigating away */}
      <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plugins" element={<PluginList />} />
            <Route path="/plugins/:name" element={<PluginDetail key={location.pathname} />} />
            <Route path="/recipes" element={<RecipeList />} />
            <Route path="/recipes/:id" element={<RecipeDetail key={location.pathname} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter basename={BASE}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
