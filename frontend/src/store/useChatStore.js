import { create } from "zustand"; 
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import {groupMessagesByDate,updateGroupedMessages,maintainOrder} from "../lib/utils";
import { encryptMessage,decryptMessage } from "../keys/encryption";

export const useChatStore = create((set, get) => ({
  groupedMessages: {}, // Primary state for grouped messages
  users: [],
  searchedUsers:[],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isOpen: false,
  cursor:null,
  hasMore:false,
  encryptFlag:true,
  modalFlag:1,
  searchBar:false,
  searchLoading:false,
  isEmpty:false,

  toggleModal: () =>
    set((state) => ({ isOpen: !state.isOpen })),

  toggleSearchBar: () =>
    set((state) => ({ searchBar: !state.searchBar })),
  
  updateEncryptFlag: (qC) => 
    set((state) => ({
      encryptFlag: state.encryptFlag && qC,
  })),

  setModalFlag: (flag) =>{set({modalFlag:flag})},

  defaultEncryptFlag: () => set({ encryptFlag: true }),

  defaultIsEmpty: () => set({ isEmpty: false }),

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

  fetchSuggestedUsers: async (query) => {
    set({ searchLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/search-users?q=${query}`);
      set({ searchedUsers: res.data });
      if(res.data.length===0){
        set({isEmpty:true});
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to fetch user suggestions !");
    }finally{
      set({ searchLoading: false });
    }
  },

  addFriend: async (friendId) => {
    try {
      await axiosInstance.post(`/messages/add-friend`,{friendId});
      toast.success("Friend added successfully !");
    } catch (error) {
      console.error("Error adding friend:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to send friend request !");
    }
  },
  

  clearSuggestions: () => set({ searchedUsers: [] }), // Clear suggestions

  getMessages: async (userId) => {
    const { cursor, groupedMessages,selectedUser,updateEncryptFlag } = get();
  
    try {
      set({isMessagesLoading:true});
      const params = {
        limit: 4,
        ...(cursor && { lastMessageTimestamp: cursor }),
      };
      const email = useAuthStore.getState().authUser?.email;
      const keyName=email.split('@')[0];
      const privateKey=sessionStorage.getItem(keyName);
  
      const res = await axiosInstance.get(`/messages/${userId}`, { params });
      const { messages, hasMore } = res.data;
      const publicKey = selectedUser.publicKey;

      const updatedMessages = await decryptMessage(messages,privateKey,publicKey);
  
      const newGroupedMessages = groupMessagesByDate(updatedMessages,updateEncryptFlag);
  
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
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    console.log(messageData);
    const { selectedUser, groupedMessages,updateEncryptFlag } = get();
    const email = useAuthStore.getState().authUser?.email;
    const keyName=email.split('@')[0];
    const privateKey=sessionStorage.getItem(keyName);
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    try {
      const publicKey = selectedUser.publicKey;
      const data = messageData.text && messageData.text;
      if (messageData.image) {
        // Don't encrypt if there is an image
        messageData.text = data;  // Ensure the text remains unmodified
      } else {
        // Encrypt message if it's text-based
        const updatedMessageData = await encryptMessage(data, privateKey, publicKey);
        messageData.text = updatedMessageData.encryptedMessage;
      }
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const newMessage =res.data;
      newMessage.text = newMessage.text?data:null;
      newMessage.qC = true;
  
      // Add new message to the groupedMessages directly
      let updatedGroupedMessages = updateGroupedMessages(groupedMessages, newMessage,updateEncryptFlag);
      set({ groupedMessages: updatedGroupedMessages });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
  
    const socket = useAuthStore.getState().socket;
    const email = useAuthStore.getState().authUser?.email;
    const keyName=email.split('@')[0];
    const privateKey=sessionStorage.getItem(keyName);
    const publicKey = selectedUser.publicKey;

    socket.off("newMessage");
  
    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      newMessage.qC = true;
      const payLoad=[newMessage];
      const updatedMessage=await decryptMessage(payLoad,privateKey,publicKey);
  
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
          [messageDate]: [...(updatedGroupedMessages[messageDate] || []), updatedMessage[0]],
        };
      
        updatedGroupedMessages = maintainOrder(updatedGroupedMessages);
        
      } else {
        // If the date already exists, just append the new message to the existing date group
        updatedGroupedMessages[messageDate] = [
          ...(updatedGroupedMessages[messageDate] || []),
          updatedMessage[0],
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