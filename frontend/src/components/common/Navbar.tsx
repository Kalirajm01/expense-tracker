import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  ListItemText,
  Stack,
  Avatar,
  Box,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../contexts/AuthContext";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  const navItems = [
    { text: "Home", icon: <HomeIcon fontSize="small" />, path: "/" },
    // { text: 'Add Expense', icon: <AddIcon fontSize="small" />, path: '/add-expense' },
    // { text: 'Expense History', icon: <HistoryIcon fontSize="small" />, path: '/expense-history' },
    {
      text: "Categories",
      icon: <CategoryIcon fontSize="small" />,
      path: "/categories",
    },
    {
      text: "Summary",
      icon: <AssessmentIcon fontSize="small" />,
      path: "/summary",
    },
  ];

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
    handleUserMenuClose();
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderRadius: 0 }}>
      <Toolbar disableGutters sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {isMobile && isAuthenticated && location.pathname !== "/landing" && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component={location.pathname === "/landing" || location.pathname === "/" ? "div" : isAuthenticated && location.pathname !== "/signin" ? RouterLink : location.pathname === "/signin" ? RouterLink : "div"}
          to={location.pathname === "/landing" || location.pathname === "/" ? undefined : isAuthenticated && location.pathname !== "/signin" ? "/" : location.pathname === "/signin" ? "/landing" : undefined}
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            cursor: location.pathname === "/landing" || location.pathname === "/" ? "default" : (location.pathname === "/signin" || (isAuthenticated && location.pathname !== "/signin")) ? "pointer" : "default",
            "&:hover": {
              opacity: location.pathname === "/landing" || location.pathname === "/" ? 1 : (location.pathname === "/signin" || (isAuthenticated && location.pathname !== "/signin")) ? 0.9 : 1,
            },
          }}
        >
          Expense Tracker
        </Typography>

        {isAuthenticated && location.pathname !== "/landing" && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
            }}
          >
            {navItems.map((item) => (
              <Tooltip key={item.path} title={item.text} arrow>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    minWidth: "auto",
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    "&.MuiButton-root": {
                      color: "white",
                      backgroundColor:
                        location.pathname === item.path
                          ? "rgba(255, 255, 255, 0.2)"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    },
                  }}
                >
                  {item.text}
                </Button>
              </Tooltip>
            ))}
          </Stack>
        )}

        {isAuthenticated && location.pathname !== "/landing" && (
          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <Typography variant="body1" sx={{ mr: 1, color: "white" }}>
              {user?.username}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleUserMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        )}

        {isAuthenticated && location.pathname !== "/landing" && (
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                width: 240,
                maxWidth: "100%",
                mt: 1,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
              },
            }}
          >
            {navItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  py: 1.5,
                  px: 2,
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.light + "1f",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.light + "2e",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {React.cloneElement(item.icon, {
                    color:
                      location.pathname === item.path ? "primary" : "inherit",
                  })}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </MenuItem>
            ))}
          </Menu>
        )}

        {isAuthenticated && location.pathname !== "/landing" && (
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                width: 200,
                maxWidth: "100%",
                mt: 1,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
