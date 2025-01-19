import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { storeKeyValue } from "../keys/key.js";
import { generateECDHKeys } from "../keys/generateKeys.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isDeleting:false,
  isUpdatingFlag:false,

  deleteProfile: async () => {
    set({ isDeleting: true });
    try {
      await axiosInstance.delete("/auth/delete-profile");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Account deleted successfully !");
    } catch (error) {
      console.log("Error in deleteAccount:", error);
      toast.error("Something went wrong !");
    } finally {
      set({ isDeleting: false });
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const keys = await generateECDHKeys();
      let updatedData={
        ...data,
        publicKey: keys.publicKey,
      }
      const keyName=data.email.split('@')[0];
      const res = await axiosInstance.post("/auth/signup", updatedData);
      set({ authUser: res.data });
      toast.success("Account created successfully !");
      get().connectSocket();
      await storeKeyValue(keyName, keys.privateKey);
    } catch (error) {
      toast.error(error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully !");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully !");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully !");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateFlag: async () => {
    set({ isUpdatingFlag: true });
    try {
      await axiosInstance.put("/auth/update-download-flag");
    } catch (error) {
      console.log("Error in update flag:", error);
      toast.error("Something went wrong !");
    } finally {
      set({ isUpdatingFlag: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));