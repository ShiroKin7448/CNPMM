import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { faqAPI } from "../services/api";

export const fetchFAQs = createAsyncThunk(
  "faq/fetchFAQs",
  async ({ category = "All", q = "" } = {}) => {
    const response = await faqAPI.list({ category, q });
    return response.data;
  },
);

const initialState = {
  allFAQs: [],
  filteredFAQs: [],
  categories: ["All"],
  selectedCategory: "All",
  query: "",
  expandedIds: [],
  isLoading: false,
  error: null,
};

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    toggleExpand: (state, action) => {
      const id = action.payload;
      const exists = state.expandedIds.includes(id);
      state.expandedIds = exists
        ? state.expandedIds.filter((itemId) => itemId !== id)
        : [...state.expandedIds, id];
    },
    expandAll: (state) => {
      state.expandedIds = state.filteredFAQs.map((item) => item.id);
    },
    collapseAll: (state) => {
      state.expandedIds = [];
    },
    clearFilters: (state) => {
      state.selectedCategory = "All";
      state.query = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFAQs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFAQs.fulfilled, (state, action) => {
        const faqs = action.payload.faqs || [];
        state.isLoading = false;
        state.allFAQs = faqs;
        state.filteredFAQs = faqs;
        state.categories = action.payload.categories?.length
          ? action.payload.categories
          : ["All"];
        state.expandedIds = faqs[0]?.id ? [faqs[0].id] : [];
      })
      .addCase(fetchFAQs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Không tải được FAQ";
      });
  },
});

export const {
  setCategory,
  setQuery,
  toggleExpand,
  expandAll,
  collapseAll,
  clearFilters,
} = faqSlice.actions;

export default faqSlice.reducer;
