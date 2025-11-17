import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DuplicateExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  existingExpense: {
    description: string;
    amount: number;
    date: string;
    category_name: string;
  } | null;
}

export const DuplicateExpenseModal: React.FC<DuplicateExpenseModalProps> = ({
  open,
  onClose,
  onConfirm,
  existingExpense,
}) => {
  if (!existingExpense) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Duplicate Expense Detected</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          An expense with the following details already exists:
        </Typography>
        <div style={{ margin: "16px 0" }}>
          <Typography>
            <strong>Description:</strong> {existingExpense.description}
          </Typography>
          <Typography>
            <strong>Amount:</strong> ₹{existingExpense.amount.toFixed(2)}
          </Typography>
          <Typography>
            <strong>Date:</strong>{" "}
            {new Date(existingExpense.date).toLocaleDateString()}
          </Typography>
          <Typography>
            <strong>Category:</strong> {existingExpense.category_name}
          </Typography>
        </div>
        <Typography variant="body1">
          Are you sure you want to add this expense again?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          autoFocus
        >
          Add Anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
};
