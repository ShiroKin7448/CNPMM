import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminAPI } from "../services/api";

const moduleOrder = ["articles", "faqs"];

const emptyData = moduleOrder.reduce((acc, key) => {
  acc[key] = [];
  return acc;
}, {});

export const fetchAdminResource = createAsyncThunk(
  "admin/fetchResource",
  async ({ resource, q = "" }) => {
    const response = await adminAPI.list(resource, q);
    return { resource, data: response.data.data || [] };
  },
);

export const createAdminItem = createAsyncThunk(
  "admin/createItem",
  async ({ resource, data }) => {
    const response = await adminAPI.create(resource, data);
    return { resource, item: response.data };
  },
);

export const updateAdminItem = createAsyncThunk(
  "admin/updateItem",
  async ({ resource, id, data }) => {
    const response = await adminAPI.update(resource, id, data);
    return { resource, item: response.data };
  },
);

export const deleteAdminItem = createAsyncThunk(
  "admin/deleteItem",
  async ({ resource, id }) => {
    await adminAPI.remove(resource, id);
    return { resource, id };
  },
);

const initialState = {
  moduleOrder,
  activeModule: "articles",
  searchQuery: "",
  data: emptyData,
  isModalOpen: false,
  modalMode: "create",
  editingItem: null,
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setActiveModule: (state, action) => {
      state.activeModule = action.payload;
      state.searchQuery = "";
      state.error = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    openCreateModal: (state) => {
      state.modalMode = "create";
      state.editingItem = null;
      state.isModalOpen = true;
    },
    openEditModal: (state, action) => {
      state.modalMode = "edit";
      state.editingItem = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingItem = null;
    },
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data[action.payload.resource] = action.payload.data;
      })
      .addCase(fetchAdminResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error?.message || "Không tải được dữ liệu quản trị";
      })
      .addCase(createAdminItem.fulfilled, (state, action) => {
        const { resource, item } = action.payload;
        state.data[resource] = [item, ...(state.data[resource] || [])];
        state.isModalOpen = false;
      })
      .addCase(updateAdminItem.fulfilled, (state, action) => {
        const { resource, item } = action.payload;
        state.data[resource] = (state.data[resource] || []).map((row) =>
          row.id === item.id ? item : row,
        );
        state.isModalOpen = false;
        state.editingItem = null;
      })
      .addCase(deleteAdminItem.fulfilled, (state, action) => {
        const { resource, id } = action.payload;
        state.data[resource] = (state.data[resource] || []).filter(
          (row) => row.id !== id,
        );
      })
      .addMatcher(
        (action) =>
          [createAdminItem.pending.type, updateAdminItem.pending.type, deleteAdminItem.pending.type].includes(
            action.type,
          ),
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          [createAdminItem.fulfilled.type, updateAdminItem.fulfilled.type, deleteAdminItem.fulfilled.type].includes(
            action.type,
          ),
        (state) => {
          state.isLoading = false;
        },
      )
      .addMatcher(
        (action) =>
          [createAdminItem.rejected.type, updateAdminItem.rejected.type, deleteAdminItem.rejected.type].includes(
            action.type,
          ),
        (state, action) => {
          state.isLoading = false;
          state.error = action.error?.message || "Thao tác admin thất bại";
        },
      );
  },
});

export const {
  setActiveModule,
  setSearchQuery,
  openCreateModal,
  openEditModal,
  closeModal,
  clearAdminError,
} = adminSlice.actions;

export default adminSlice.reducer;
