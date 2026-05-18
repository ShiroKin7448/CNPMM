// Storage helpers for persisting data
export const storage = {
  user: {
    get: () => {
      try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
      } catch (error) {
        console.error("Error getting user from storage:", error);
        return null;
      }
    },
    set: (user) => {
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        console.error("Error setting user in storage:", error);
      }
    },
    remove: () => {
      try {
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Error removing user from storage:", error);
      }
    },
  },

  token: {
    get: () => localStorage.getItem("accessToken"),
    set: (token) => localStorage.setItem("accessToken", token),
    remove: () => localStorage.removeItem("accessToken"),
  },

  clear: () => {
    localStorage.clear();
  },
};
