import api from './api';

const EXPENSE_API = '/expenses';

export const getExpenses = async (filters = {}) => {
  try {
    const response = await api.get(EXPENSE_API, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const createExpense = async (expenseData, force = false) => {
  try {
    const params = force ? { force_create: true } : {};
    const response = await api.post(EXPENSE_API, expenseData, { params });
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const updateExpense = async (id, expenseData) => {
  try {
    const response = await api.put(`${EXPENSE_API}/${id}`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`${EXPENSE_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const getExpenseSummary = async () => {
  try {
    const response = await api.get(`${EXPENSE_API}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    throw error;
  }
};
