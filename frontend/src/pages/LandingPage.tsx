import React from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
        py: isMobile ? 4 : 8,
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: "center",
            mb: isMobile ? 6 : 10,
            py: isMobile ? 4 : 8,
          }}
        >
          <Typography
            variant={isMobile ? "h3" : "h1"}
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Expense Tracker
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: 2,
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/signin")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 2,
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/signup")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 2,
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;