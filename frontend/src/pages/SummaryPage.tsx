import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { format, subMonths } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getExpenseSummary,
  getExpenses,
  deleteExpense,
} from "../services/expenseService";
import { getCategories } from "../services/categoryService";

interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  category_name: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
}

interface CategorySummary {
  name: string;
  total: number;
}

interface SummaryData {
  totalExpenses: number;
  topCategories: CategorySummary[];
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const SummaryPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Format date to YYYY-MM-DD for consistent comparison
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, expensesData, categoriesData] = await Promise.all([
          getExpenseSummary(),
          getExpenses(),
          getCategories(),
        ]);

        setCategories(categoriesData);

        // Sort expenses by date in descending order (newest first)
        const sortedExpenses = [...expensesData].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setSummaryData(summaryData);
        setExpenses(sortedExpenses);
        setError(null);
      } catch (err) {
        setError("Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpense(expenseToDelete);
      setExpenses(expenses.filter((expense) => expense.id !== expenseToDelete));
      // Refresh the summary data after deletion
      const updatedSummary = await getExpenseSummary();
      setSummaryData(updatedSummary);
      setDeleteDialogOpen(false);
    } catch (err) {
      setError("Failed to delete expense");
      console.error("Error deleting expense:", err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setPage(0);
  };

  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
  };

  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  // Apply filters based on current filter states
  const applyFilters = () => {
    // If no filters are set, show all expenses
    if (!selectedCategory && !startDate && !endDate) {
      setFilteredExpenses(expenses);
      setFiltersApplied(false);
      return;
    }

    const filtered = expenses.filter((expense) => {
      // Category filter
      const matchesCategory =
        !selectedCategory ||
        expense.category_id.toString() === selectedCategory.toString();

      if (!startDate && !endDate) {
        return matchesCategory;
      }

      const expenseDate = new Date(expense.date);
      
      // Convert to timestamps for comparison
      const expenseTime = expenseDate.getTime();
      const startTime = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const endTime = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      // Apply date filters
      const matchesStartDate = !startTime || expenseTime >= startTime;
      const matchesEndDate = !endTime || expenseTime <= endTime;

      return matchesCategory && matchesStartDate && matchesEndDate;
    });

    setFilteredExpenses(filtered);
    setFiltersApplied(true);
  };

  // Reset filters and show all data
  const resetFilters = () => {
    setSelectedCategory("");
    setStartDate(null);
    setEndDate(null);
    setFiltersApplied(false);
    setFilteredExpenses(expenses);
  };

  // Initialize filtered expenses when expenses change
  useEffect(() => {
    setFilteredExpenses(expenses);
  }, [expenses]);

  // Apply filters when any filter value changes and filters are applied
  useEffect(() => {
    if (filtersApplied) {
      applyFilters();
    }
  }, [selectedCategory, startDate, endDate, expenses]);

  const getCategoryColor = (categoryId: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ];
    return colors[categoryId % colors.length];
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2} mb={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Typography variant="h4" gutterBottom>
        Expense Summary
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {selectedCategory
                ? `${
                    categories.find(
                      (c: Category) => c.id === parseInt(selectedCategory, 10)
                    )?.name || "Selected Category"
                  } Expenses`
                : "Total Expenses"}
            </Typography>
            <Typography variant="h4">
              ₹
              {selectedCategory
                ? filteredExpenses
                    .reduce((sum, exp) => sum + exp.amount, 0)
                    .toFixed(2)
                : summaryData?.totalExpenses?.toFixed(2) || "0.00"}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Top Categories
            </Typography>
            {summaryData?.topCategories &&
            summaryData.topCategories.length > 0 ? (
              <List>
                {summaryData.topCategories.map((category, index) => (
                  <React.Fragment key={category.name}>
                    <ListItem>
                      <ListItemText
                        primary={`${index + 1}. ${category.name}`}
                        secondary={`₹${category.total.toFixed(2)}`}
                      />
                    </ListItem>
                    {index < summaryData.topCategories.length - 1 && (
                      <Divider />
                    )}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography>No category data available</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: isMobile ? 1 : 3, mb: 4, overflowX: "auto" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h6">Recent Expenses</Typography>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            width={isMobile ? "100%" : "auto"}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => {
                  if (newValue) {
                    // Set time to start of day in local timezone
                    const date = new Date(newValue);
                    date.setHours(0, 0, 0, 0);
                    setStartDate(date);
                    
                    // If end date is before new start date, update it
                    if (endDate && date > endDate) {
                      const newEndDate = new Date(date);
                      newEndDate.setHours(23, 59, 59, 999);
                      setEndDate(newEndDate);
                    }
                  } else {
                    setStartDate(null);
                  }
                }}
                maxDate={endDate || undefined}
                slotProps={{
                  textField: { 
                    size: "small", 
                    fullWidth: isMobile,
                    error: false,
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => {
                  if (newValue) {
                    // Set time to end of day in local timezone
                    const date = new Date(newValue);
                    date.setHours(23, 59, 59, 999);
                    setEndDate(date);
                  } else {
                    setEndDate(null);
                  }
                }}
                minDate={startDate || undefined}
                slotProps={{
                  textField: { 
                    size: "small", 
                    fullWidth: isMobile,
                    error: false,
                  },
                }}
                disableFuture
              />
            </LocalizationProvider>
            <FormControl
              size="small"
              sx={{ minWidth: 150 }}
              fullWidth={isMobile}
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {Array.from(new Set(expenses.map((e) => e.category_name))).map(
                  (category) => (
                    <MenuItem
                      key={category}
                      value={
                        expenses.find((e) => e.category_name === category)
                          ?.category_id
                      }
                    >
                      {category}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={!selectedCategory && !startDate && !endDate}
              fullWidth={isMobile}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              onClick={resetFilters}
              disabled={!selectedCategory && !startDate && !endDate}
              fullWidth={isMobile}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((expense) => (
                  <StyledTableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.category_name}
                        size="small"
                        sx={{
                          backgroundColor: `${getCategoryColor(
                            expense.category_id
                          )}20`,
                          color: getCategoryColor(expense.category_id),
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(expense.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredExpenses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this expense?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SummaryPage;
