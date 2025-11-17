import api from './api';

const CATEGORY_API = '/categories';

export const getCategories = async () => {
  try {
    const response = await api.get(CATEGORY_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post(CATEGORY_API, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`${CATEGORY_API}/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`${CATEGORY_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getExpensesByCategory = async (categoryId) => {
  try {
    const response = await api.get(`${CATEGORY_API}/${categoryId}/expenses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    throw error;
  }
};
