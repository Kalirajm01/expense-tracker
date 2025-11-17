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
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import AssessmentIcon from "@mui/icons-material/Assessment";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderRadius: 0 }}>
      <Toolbar disableGutters sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {isMobile && (
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
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          Expense Tracker
        </Typography>

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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
