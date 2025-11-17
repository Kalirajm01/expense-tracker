import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import { getExpenses } from "../services/expenseService";

interface Category {
  id: number;
  name: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesWithExpenses, setCategoriesWithExpenses] = useState<
    Set<number>
  >(new Set());

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [categories, expenses] = await Promise.all([
        getCategories(),
        getExpenses(),
      ]);

      setCategories(categories);

      // Find all category IDs that have expenses
      const usedCategoryIds = new Set<number>();
      expenses.forEach((expense: any) => {
        usedCategoryIds.add(expense.category_id);
      });

      setCategoriesWithExpenses(usedCategoryIds);
      setError(null);
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate category name is not empty or just whitespace
    if (!categoryName.trim()) {
      setError("Category name cannot be empty or contain only spaces");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryName.trim() });
      } else {
        await createCategory({ name: categoryName.trim() });
      }
      await fetchCategories();
      handleClose();
    } catch (err) {
      setError(
        editingCategory
          ? "Failed to update category"
          : "Failed to create category"
      );
      console.error("Error saving category:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (categoriesWithExpenses.has(id)) {
      setError("Cannot delete category with associated expenses");
      return;
    }

    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        setLoading(true);
        await deleteCategory(id);
        await fetchCategories();
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || "Failed to delete category";
        setError(errorMessage);
        console.error("Error deleting category:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && categories.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(category)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(category.id)}
                      disabled={
                        loading || categoriesWithExpenses.has(category.id)
                      }
                      title={
                        categoriesWithExpenses.has(category.id)
                          ? "Cannot delete category with expenses"
                          : "Delete category"
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found. Add your first category!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              disabled={loading}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : editingCategory ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
