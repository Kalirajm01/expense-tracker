import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, useMediaQuery } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import HomePage from "./pages/HomePage";
import AddExpensePage from "./pages/AddExpensePage";
import ExpenseHistoryPage from "./pages/ExpenseHistoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import SummaryPage from "./pages/SummaryPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import LandingPage from "./pages/LandingPage";
import theme from "./theme";

// Component to handle auth-based routing for public pages
const AuthRedirectRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, show the page
  return <>{children}</>;
};

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Navbar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: isMobile ? 1.5 : 3,
                pt: isMobile ? 2 : 3,
                pb: isMobile ? 2 : 3,
                maxWidth: 1400,
                width: "100%",
                mx: "auto",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Routes>
                <Route path="/landing" element={<LandingPage />} />
                <Route
                  path="/signin"
                  element={
                    <AuthRedirectRoute>
                      <SignInPage />
                    </AuthRedirectRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <AuthRedirectRoute>
                      <SignUpPage />
                    </AuthRedirectRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-expense"
                  element={
                    <ProtectedRoute>
                      <AddExpensePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expense-history"
                  element={
                    <ProtectedRoute>
                      <ExpenseHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <CategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/summary"
                  element={
                    <ProtectedRoute>
                      <SummaryPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
