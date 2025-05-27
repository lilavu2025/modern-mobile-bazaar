import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import SEO from "@/components/SEO";
import { PerformanceMonitorComponent } from "@/components/PerformanceMonitor";
import { lazy, Suspense, memo } from "react";

// Pages - Regular imports for frequently accessed pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmailConfirmation from "./pages/EmailConfirmation";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";

// Lazy load less frequently accessed pages with preload hints
const Orders = lazy(() => 
  import("./pages/Orders").then(module => ({ default: module.default }))
);
const Profile = lazy(() => 
  import("./pages/Profile").then(module => ({ default: module.default }))
);
const Contact = lazy(() => 
  import("./pages/Contact").then(module => ({ default: module.default }))
);
const Offers = lazy(() => 
  import("./pages/Offers").then(module => ({ default: module.default }))
);
const Checkout = lazy(() => 
  import("./pages/Checkout").then(module => ({ default: module.default }))
);
const AdminDashboard = lazy(() => 
  import("./pages/AdminDashboard").then(module => ({ default: module.default }))
);

// Enhanced loading component with better UX
const PageLoader = memo(() => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
    <p className="text-gray-600 animate-pulse">Loading...</p>
  </div>
));

// Optimized QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <TooltipProvider>
                  <SEO />
                  <PerformanceMonitorComponent />
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/email-confirmation" element={<EmailConfirmation />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/offers" element={
                        <Suspense fallback={<PageLoader />}>
                          <Offers />
                        </Suspense>
                      } />
                      <Route path="/contact" element={
                        <Suspense fallback={<PageLoader />}>
                          <Contact />
                        </Suspense>
                      } />
                      
                      {/* Protected Routes */}
                      <Route path="/orders" element={
                        <ProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <Orders />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <Profile />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      <Route path="/checkout" element={
                        <ProtectedRoute>
                          <Suspense fallback={<PageLoader />}>
                            <Checkout />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin Routes */}
                      <Route path="/admin/*" element={
                        <ProtectedRoute requireAdmin>
                          <Suspense fallback={<PageLoader />}>
                            <AdminDashboard />
                          </Suspense>
                        </ProtectedRoute>
                      } />
                      
                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
