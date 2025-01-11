import { create } from "zustand"; 
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import {groupMessagesByDate,updateGroupedMessages,maintainOrder} from "../lib/utils";

export const useChatStore = create((set, get) => ({
  groupedMessages: {}, // Primary state for grouped messages
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isOpen: false,
  cursor:null,
  hasMore:false,
  encryptFlag:true,
  modalFlag:1,

  toggleModal: () =>
    set((state) => ({ isOpen: !state.isOpen })),
  
  updateEncryptFlag: (qC) => 
    set((state) => ({
      encryptFlag: state.encryptFlag && qC,
  })),

  setModalFlag: (flag) =>{set({modalFlag:flag})},

  defaultEncryptFlag: () => set({ encryptFlag: true }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    const { cursor, groupedMessages,selectedUser,updateEncryptFlag } = get();
  
    try {
      set({isMessagesLoading:true});
      const params = {
        limit: 4,
        ...(cursor && { lastMessageTimestamp: cursor }),
      };

      const headers = {
        publicKey: `${selectedUser.publicKey}`,
      };
  
      const res = await axiosInstance.get(`/messages/${userId}`, { params,headers });
      const { messages, hasMore } = res.data;
  
      const newGroupedMessages = groupMessagesByDate(messages,updateEncryptFlag);
  
      // Merge newGroupedMessages with the existing groupedMessages
      let updatedGroupedMessages = { ...groupedMessages };
  
      // Iterate through the new grouped messages and merge them
      for (const [date, messageGroup] of Object.entries(newGroupedMessages)) {
        if (updatedGroupedMessages[date]) {
          // If a group for the same date exists, prepend the new messages to the top
          updatedGroupedMessages[date] = [
            ...messageGroup,
            ...updatedGroupedMessages[date],
          ];
        } else {
          // Otherwise, just add the new message group for that date
          updatedGroupedMessages = {
            [date]: messageGroup,
            ...updatedGroupedMessages,
          };

          updatedGroupedMessages = maintainOrder(updatedGroupedMessages);
        }
      }

      set({
        groupedMessages: updatedGroupedMessages,
        cursor: messages.length > 0 ? messages[0].createdAt : cursor,
        hasMore,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, groupedMessages,updateEncryptFlag } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    try {
      const updatedMessageData = {
        ...messageData,
        publicKey: selectedUser.publicKey, 
      };
  
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, updatedMessageData);

      const newMessage =res.data;
  
      // Add new message to the groupedMessages directly
      let updatedGroupedMessages = updateGroupedMessages(groupedMessages, newMessage,updateEncryptFlag);
      set({ groupedMessages: updatedGroupedMessages });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
  
    const socket = useAuthStore.getState().socket;

    socket.off("newMessage");
  
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
  
      const currentGroupedMessages = get().groupedMessages;
  
      // Determine the group name for the message
      const messageDate = dayjs(newMessage.createdAt).format("D MMMM YYYY");
  
      // Update the groupedMessages
      let updatedGroupedMessages = {
        ...currentGroupedMessages,
      };
      
      // Add the new message for the given messageDate
      if (!updatedGroupedMessages[messageDate]) {
        // If the date doesn't exist, create a new group and perform sorting
        updatedGroupedMessages = {
          ...updatedGroupedMessages,
          [messageDate]: [...(updatedGroupedMessages[messageDate] || []), newMessage],
        };
      
        updatedGroupedMessages = maintainOrder(updatedGroupedMessages);
        
      } else {
        // If the date already exists, just append the new message to the existing date group
        updatedGroupedMessages[messageDate] = [
          ...(updatedGroupedMessages[messageDate] || []),
          newMessage,
        ];
      }
  
      set({ groupedMessages: updatedGroupedMessages });
    });
  },

  setSelectedUser: (selectedUser) => {
    // Reset state when switching to a new user
    set({
      selectedUser,
      cursor: null,
      hasMore: true,
      groupedMessages: {}, // Clear messages when selecting a new user
    });

    // Re-subscribe to messages for the selected user
    get().subscribeToMessages();
  },
}));