import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { forumAPI } from "../services/api";

export const fetchForumThreads = createAsyncThunk(
  "forum/fetchThreads",
  async (q = "") => {
    const response = await forumAPI.listThreads(q);
    return response.data.threads || [];
  },
);

export const createForumThread = createAsyncThunk(
  "forum/createThread",
  async (data) => {
    const response = await forumAPI.createThread(data);
    return response.data;
  },
);

export const createForumReply = createAsyncThunk(
  "forum/createReply",
  async ({ threadId, content }) => {
    const response = await forumAPI.createReply(threadId, { content });
    return response.data;
  },
);

export const upvoteForumThread = createAsyncThunk(
  "forum/upvoteThread",
  async (threadId) => {
    const response = await forumAPI.upvoteThread(threadId);
    return response.data;
  },
);

export const toggleForumSolved = createAsyncThunk(
  "forum/toggleSolved",
  async (threadId) => {
    const response = await forumAPI.toggleSolved(threadId);
    return response.data;
  },
);

export const toggleForumPin = createAsyncThunk(
  "forum/togglePin",
  async (threadId) => {
    const response = await forumAPI.togglePin(threadId);
    return response.data;
  },
);

export const deleteForumThread = createAsyncThunk(
  "forum/deleteThread",
  async (threadId) => {
    await forumAPI.deleteThread(threadId);
    return threadId;
  },
);

export const deleteForumReply = createAsyncThunk(
  "forum/deleteReply",
  async ({ threadId, replyId }) => {
    const response = await forumAPI.deleteReply(threadId, replyId);
    return response.data;
  },
);

const initialState = {
  threads: [],
  activeThreadId: null,
  searchQuery: "",
  isLoading: false,
  error: null,
};

const replaceThread = (state, thread) => {
  const index = state.threads.findIndex((item) => item.id === thread.id);
  if (index >= 0) {
    state.threads[index] = thread;
  } else {
    state.threads.unshift(thread);
  }
};

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    setActiveThread: (state, action) => {
      state.activeThreadId = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearForumError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForumThreads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchForumThreads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.threads = action.payload;
        if (!state.activeThreadId && action.payload[0]?.id) {
          state.activeThreadId = action.payload[0].id;
        }
      })
      .addCase(fetchForumThreads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Không tải được forum";
      })
      .addCase(createForumThread.fulfilled, (state, action) => {
        state.threads.unshift(action.payload);
        state.activeThreadId = action.payload.id;
      })
      .addCase(deleteForumThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter((thread) => thread.id !== action.payload);
        if (state.activeThreadId === action.payload) {
          state.activeThreadId = state.threads[0]?.id || null;
        }
      })
      .addMatcher(
        (action) =>
          [
            createForumReply.fulfilled.type,
            upvoteForumThread.fulfilled.type,
            toggleForumSolved.fulfilled.type,
            toggleForumPin.fulfilled.type,
            deleteForumReply.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          replaceThread(state, action.payload);
        },
      )
      .addMatcher(
        (action) =>
          [
            createForumThread.pending.type,
            createForumReply.pending.type,
            upvoteForumThread.pending.type,
            toggleForumSolved.pending.type,
            toggleForumPin.pending.type,
            deleteForumThread.pending.type,
            deleteForumReply.pending.type,
          ].includes(action.type),
        (state) => {
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          [
            createForumThread.rejected.type,
            createForumReply.rejected.type,
            upvoteForumThread.rejected.type,
            toggleForumSolved.rejected.type,
            toggleForumPin.rejected.type,
            deleteForumThread.rejected.type,
            deleteForumReply.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.error = action.error?.message || "Thao tác forum thất bại";
        },
      );
  },
});

export const { setActiveThread, setSearchQuery, clearForumError } =
  forumSlice.actions;

export default forumSlice.reducer;
