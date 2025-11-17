import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TablePagination,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, subMonths } from "date-fns";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import axios from "axios";

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

const ExpenseHistoryPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(
    subMonths(new Date(), 1)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState<{
    amount: string;
    description: string;
    category_id: number;
    date: string;
  }>({ amount: "", description: "", category_id: 0, date: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesRes, categoriesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/expenses"),
          axios.get("http://localhost:5000/api/categories"),
        ]);
        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        setError("Failed to fetch data");
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

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
    setPage(0);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory =
      !selectedCategory ||
      expense.category_id.toString() === selectedCategory.toString();
    const expenseDate = new Date(expense.date);
    const matchesStartDate = !startDate || expenseDate >= startDate;
    const matchesEndDate = !endDate || expenseDate <= endDate!;
    return matchesCategory && matchesStartDate && matchesEndDate;
  });

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await axios.delete(`http://localhost:5000/api/expenses/${id}`);
        setExpenses(expenses.filter((expense) => expense.id !== id));
      } catch (err) {
        setError("Failed to delete expense");
        console.error("Error deleting expense:", err);
      }
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setEditFormData({
      amount: expense.amount.toString(),
      description: expense.description,
      category_id: expense.category_id,
      date: format(new Date(expense.date), "yyyy-MM-dd"),
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "category_id" ? Number(value) : value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/expenses/${editingExpense.id}`,
        {
          ...editFormData,
          amount: parseFloat(editFormData.amount),
        }
      );

      setExpenses(
        expenses.map((exp) =>
          exp.id === editingExpense.id
            ? {
                ...response.data,
                category_name:
                  categories.find((c) => c.id === response.data.category_id)
                    ?.name || "",
              }
            : exp
        )
      );

      setEditingExpense(null);
    } catch (err) {
      setError("Failed to update expense");
      console.error("Error updating expense:", err);
    }
  };

  const handleCloseEditDialog = () => {
    setEditingExpense(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        mt: isMobile ? 2 : 4,
        mb: 4,
        px: isMobile ? 1 : 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          Expense History
        </Typography>

        {!isMobile && (
          <Chip
            label={`${filteredExpenses.length} expenses`}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderWidth: 2,
              "& .MuiChip-label": {
                px: 1.5,
              },
            }}
          />
        )}
      </Box>

      <Paper
        sx={{
          p: isMobile ? 2 : 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr 1fr" }}
          gap={3}
        >
          <FormControl fullWidth>
            <InputLabel id="category-filter-label">
              Filter by Category
            </InputLabel>
            <Select
              labelId="category-filter-label"
              value={selectedCategory}
              label="Filter by Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              format="MM/dd/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              format="MM/dd/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Paper>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <TableContainer>
          <Table>
            <TableBody>
              {filteredExpenses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((expense) => (
                  <StyledTableRow key={expense.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {format(
                          new Date(expense.date),
                          isMobile ? "MMM dd" : "MMM dd, yyyy"
                        )}
                      </Typography>
                      {isMobile && (
                        <Typography variant="caption" color="text.secondary">
                          {expense.category_name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: isMobile ? 150 : "none" }}>
                        <Typography noWrap>
                          {expense.description || "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Chip
                          label={expense.category_name}
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.primary.light + "22",
                            color: theme.palette.primary.dark,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        ₹
                        {parseFloat(expense.amount.toString()).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        aria-label="edit"
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(expense)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No expenses found. Add your first expense to get started!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredExpenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                mb: 0,
              },
            "& .MuiTablePagination-toolbar": {
              flexWrap: isMobile ? "wrap" : "nowrap",
              gap: 1,
            },
            "& .MuiTablePagination-actions": {
              ml: isMobile ? 0 : 1,
            },
          }}
        />
      </Paper>

      <Dialog
        open={!!editingExpense}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle>Edit Expense</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Box display="grid" gap={2} sx={{ mt: 1 }}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={editFormData.amount}
                onChange={handleEditFormChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ step: "0.01", min: "0.01" }}
              />

              <TextField
                label="Description"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category_id"
                  value={editFormData.category_id}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      category_id: Number(e.target.value),
                    }))
                  }
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Date"
                name="date"
                type="date"
                value={editFormData.date}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} startIcon={<CloseIcon />}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ExpenseHistoryPage;
