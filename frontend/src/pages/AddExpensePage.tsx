import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createExpense } from "../services/expenseService";
import { getCategories } from "../services/categoryService";
import { DuplicateExpenseModal } from "../components/DuplicateExpenseModal";

interface Category {
  id: number;
  name: string;
}

const AddExpensePage: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [pendingExpense, setPendingExpense] = useState<any>(null);
  const [duplicateExpense, setDuplicateExpense] = useState<any>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError("Failed to load categories");
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers and one decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleAmountBlur = () => {
    if (amount) {
      // Round to 2 decimal places
      const num = parseFloat(amount);
      if (!isNaN(num)) {
        setAmount(num.toFixed(2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!amount || !categoryId || !date) {
      setError("Please fill in all required fields");
      return;
    }

    // Round to 2 decimal places before sending to the server
    const roundedAmount = Math.round(parseFloat(amount) * 100) / 100;

    const expenseData = {
      amount: roundedAmount,
      description,
      date: date.toISOString().split("T")[0],
      category_id: parseInt(categoryId),
    };

    console.log("Rounded amount:", roundedAmount);

    console.log("Sending expense data:", expenseData);
    console.log("Description value:", description);
    console.log("Description type:", typeof description);
    console.log("Description length:", description.length);

    try {
      setLoading(true);
      setError(null);

      const newExpense = await createExpense(expenseData);
      console.log("Response from server:", newExpense);
      
      setSuccess(true);
      setAmount("");
      setDescription("");
      setDate(new Date());
      setCategoryId("");
    } catch (err: any) {
      console.error("Error adding expense:", err);
      const errorMsg = err.response?.data?.error || "Failed to add expense. Please try again.";
      setError(errorMsg);
      
      // Handle duplicate expense case
      if (err.response?.status === 409) {
        setPendingExpense(expenseData);
        setDuplicateExpense(err.response.data.existing_expense);
        setShowDuplicateModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!pendingExpense) return;

    try {
      setLoading(true);
      setError(null);
      setShowDuplicateModal(false);

      // Prepare the expense data with the correct structure
      const expenseData = {
        amount: pendingExpense.amount,
        description: pendingExpense.description,
        date: pendingExpense.date, // This should already be in 'YYYY-MM-DD' format from handleSubmit
        category_id: pendingExpense.category_id,
        force_create: true, // Add a flag to bypass duplicate check
      };

      console.log("Sending force create request with data:", expenseData);

      // Add the expense with force flag
      const newExpense = await createExpense(expenseData, true);
      console.log("Force create response:", newExpense);
      handleSuccess();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error adding expense:", err);
    } finally {
      setLoading(false);
      setPendingExpense(null);
      setDuplicateExpense(null);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    setAmount("");
    setDescription("");
    setDate(new Date());
    setCategoryId("");
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCloseDuplicateModal = () => {
    setShowDuplicateModal(false);
    setPendingExpense(null);
    setDuplicateExpense(null);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Expense
        </Typography>

        <Paper sx={{ p: 4, mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Expense added successfully!
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <TextField
                  label="Amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  required
                  fullWidth
                  margin="normal"
                  inputProps={{
                    inputMode: "decimal",
                    step: "0.01",
                    min: "0.01",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    value={categoryId}
                    label="Category"
                    onChange={(e: SelectChangeEvent) =>
                      setCategoryId(e.target.value)
                    }
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    format="MM/dd/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              <Box />

              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a note about this expense (optional)"
                />
              </Box>

              <Box sx={{ gridColumn: "1 / -1" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? "Adding..." : "Add Expense"}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>

        <DuplicateExpenseModal
          open={showDuplicateModal}
          onClose={handleCloseDuplicateModal}
          onConfirm={handleConfirmDuplicate}
          existingExpense={duplicateExpense}
        />
      </Box>
    </Container>
  );
};

export default AddExpensePage;
