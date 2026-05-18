import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import searchReducer from "./searchSlice";
import faqReducer from "./faqSlice";
import adminReducer from "./adminSlice";
import forumReducer from "./forumSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    faq: faqReducer,
    admin: adminReducer,
    forum: forumReducer,
  },
});

export default store;
