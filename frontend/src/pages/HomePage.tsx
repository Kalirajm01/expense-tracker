import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import { format } from "date-fns";
import Chart from "react-apexcharts";
import { DuplicateExpenseModal } from "../components/DuplicateExpenseModal";
import {
  getExpenses,
  createExpense,
  getExpenseSummary,
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

interface NewExpense {
  amount: string;
  description: string;
  date: string;
  category_id: string | number;
}

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; total: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState<NewExpense>({
    amount: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category_id: "",
  });
  const [formErrors, setFormErrors] = useState({
    amount: "",
    description: "",
    category_id: "",
    date: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<any>(null);
  const [duplicateExpense, setDuplicateExpense] = useState<any>(null);

  // Process monthly data for the chart
  const processMonthlyData = (expenses: Expense[]) => {
    const monthlyTotals: { [key: string]: number } = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(date, "MMM yyyy");
      monthlyTotals[monthKey] = 0;
    }

    // Calculate totals
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const monthKey = format(expenseDate, "MMM yyyy");
      if (monthlyTotals.hasOwnProperty(monthKey)) {
        monthlyTotals[monthKey] += expense.amount;
      }
    });

    // Format for chart
    const result = Object.entries(monthlyTotals).map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)),
    }));

    setMonthlyData(result);
    setChartLoading(false);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesData, categoriesData, summaryData] = await Promise.all([
          getExpenses(),
          getCategories(),
          getExpenseSummary(),
        ]);

        const sortedExpenses = [...expensesData].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setExpenses(sortedExpenses);
        setCategories(categoriesData);
        setTotalExpenses(summaryData.totalExpenses || 0);
        processMonthlyData(sortedExpenses);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Table pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get color for category chips
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

  // Modal handlers
  const handleOpenAddModal = () => {
    setOpenAddModal(true);
    setNewExpense({
      amount: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category_id: categories[0]?.id || "",
    });
    setFormErrors({ amount: "", description: "", category_id: "", date: "" });
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      amount: "",
      description: "",
      category_id: "",
      date: "",
    };

    if (
      !newExpense.amount ||
      isNaN(Number(newExpense.amount)) ||
      Number(newExpense.amount) <= 0
    ) {
      newErrors.amount = "Please enter a valid amount";
      valid = false;
    }

    if (!newExpense.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    }

    if (!newExpense.category_id) {
      newErrors.category_id = "Please select a category";
      valid = false;
    }

    if (newExpense.date) {
      const selectedDate = new Date(newExpense.date);
      const today = new Date();
      const selectedDateStr = selectedDate.toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];

      if (selectedDateStr > todayStr) {
        newErrors.date = "Cannot add expenses for future dates";
        valid = false;
      }
    }

    setFormErrors(newErrors);
    return valid;
  };

  // Expense CRUD operations
  const handleAddExpense = async () => {
    if (!validateForm()) return;

    const expenseData = {
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      category_id: parseInt(newExpense.category_id as string, 10),
    };

    try {
      const response = await createExpense(expenseData);
      setExpenses((prev) => [response, ...prev]);
      handleCloseAddModal();
    } catch (error: any) {
      if (error.response?.status === 409) {
        setPendingExpense(expenseData);
        setDuplicateExpense(error.response.data.existing_expense);
        setShowDuplicateModal(true);
        return;
      }
      setError(
        error.response?.data?.error ||
          "Failed to add expense. Please try again."
      );
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!pendingExpense) return;

    try {
      const response = await createExpense({
        ...pendingExpense,
        force_create: true,
      });

      setExpenses((prev) => [response, ...prev]);
      handleCloseAddModal();
      setShowDuplicateModal(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        "Failed to add expense. Please try again.";
      setError(errorMsg);
    } finally {
      setPendingExpense(null);
      setDuplicateExpense(null);
    }
  };

  const handleCloseDuplicateModal = () => {
    setShowDuplicateModal(false);
    setPendingExpense(null);
    setDuplicateExpense(null);
  };

  // Render the component
  return (
    <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4, pb: 8 }}>
      {/* Header with Total Expenses and Buttons */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Card sx={{ width: { xs: "100%", sm: "auto" }, minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                ₹{totalExpenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            sx={{
              width: { xs: "100%", sm: "auto" },
              "& > *": { width: { xs: "100%", sm: "auto" } },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              fullWidth={isMobile}
            >
              Add New Expense
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate("/summary")}
              fullWidth={isMobile}
            >
              View Summary
            </Button>
          </Stack>
        </Box>

        {/* Monthly Expenses Chart */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Monthly Expenses
          </Typography>
          {chartLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ height: 300 }}>
              <Chart
                options={{
                  chart: {
                    type: "line",
                    toolbar: { show: false },
                    zoom: { enabled: false },
                  },
                  stroke: { width: 3, curve: "smooth" },
                  xaxis: {
                    categories: monthlyData.map((item) => item.month),
                    labels: {
                      style: {
                        fontSize: "12px",
                        fontFamily: "Roboto, sans-serif",
                      },
                    },
                  },
                  yaxis: {
                    labels: {
                      formatter: (value) => `₹${value.toFixed(2)}`,
                      style: {
                        fontSize: "12px",
                        fontFamily: "Roboto, sans-serif",
                      },
                    },
                  },
                  tooltip: {
                    y: { formatter: (value) => `₹${value.toFixed(2)}` },
                  },
                  colors: [theme.palette.primary.main],
                  markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
                }}
                series={[
                  {
                    name: "Expenses",
                    data: monthlyData.map((item) => item.total),
                  },
                ]}
                type="line"
                height="100%"
              />
            </Box>
          )}
        </Card>
      </Box>

      {/* Recent Expenses Table */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Recent Expenses
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((expense) => (
                      <TableRow
                        key={expense.id}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
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
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          {format(new Date(expense.date), "dd MMM yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={expenses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </>
        )}
      </Paper>

      {/* Add Expense Dialog */}
      <Dialog
        open={openAddModal}
        onClose={handleCloseAddModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Amount"
              name="amount"
              type="number"
              value={newExpense.amount}
              onChange={handleInputChange}
              error={!!formErrors.amount}
              helperText={formErrors.amount}
              inputProps={{ step: "0.01", min: "0.01" }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              value={newExpense.description}
              onChange={handleInputChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Date"
              type="date"
              name="date"
              value={newExpense.date}
              onChange={handleInputChange}
              error={!!formErrors.date}
              helperText={formErrors.date}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: format(new Date(), "yyyy-MM-dd") }}
            />
            <TextField
              select
              fullWidth
              margin="normal"
              label="Category"
              name="category_id"
              value={newExpense.category_id || ""}
              onChange={handleInputChange}
              error={!!formErrors.category_id}
              helperText={formErrors.category_id}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pr: 3, pb: 3 }}>
          <Button
            onClick={handleCloseAddModal}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddExpense}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Expense Modal */}
      <DuplicateExpenseModal
        open={showDuplicateModal}
        onClose={handleCloseDuplicateModal}
        onConfirm={handleConfirmDuplicate}
        existingExpense={duplicateExpense}
      />
    </Container>
  );
};

export default HomePage;
