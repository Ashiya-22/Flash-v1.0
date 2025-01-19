import dayjs from "dayjs";
import toast from "react-hot-toast";
import { storeKeyValue,getValueByKey } from "../keys/key";

// ChatContainer.jsx
export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

// useChatStore.js
export function groupMessagesByDate(messages,updateEncryptFlag) {
  const groupedMessages = {};
  for (const message of messages) {
    const messageDate = dayjs(message.createdAt);
    updateEncryptFlag(message.qC);
    let groupKey = messageDate.format("D MMMM YYYY");

    if (!groupedMessages[groupKey]) {
      groupedMessages[groupKey] = [];
    }

    groupedMessages[groupKey].push(message);
  }

  return groupedMessages;
}

export function updateGroupedMessages(groupedMessages, newMessage,updateEncryptFlag) {
  const messageDate = dayjs(newMessage.createdAt);
  updateEncryptFlag(newMessage.qC);
  let groupKey = messageDate.format("D MMMM YYYY");

  // Update the grouped messages
  let updatedGroupedMessages = { ...groupedMessages };
  if (!updatedGroupedMessages[groupKey]) {
    updatedGroupedMessages[groupKey] = [];
    updatedGroupedMessages[groupKey].push(newMessage);
    updatedGroupedMessages=maintainOrder(updatedGroupedMessages);
  }
  else{
    updatedGroupedMessages[groupKey].push(newMessage);
  }

  return updatedGroupedMessages;
}

export function maintainOrder(groupedMessages){
  return Object.keys(groupedMessages)
  .sort((a, b) => new Date(a) - new Date(b)) // Sorting keys by date
  .reduce((acc, key) => {
    acc[key] = groupedMessages[key]; 
    return acc;
  }, {}); // Initialize the accumulator as an empty object
}

// KeyDisplay.jsx
export const downloadFile = (key) => {
  // Create a Blob object from the text content
  const blob = new Blob([key], { type: 'text/plain' });

  // Create an object URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Flash_PAK.key'; // Set the default file name

  // Programmatically trigger a click event on the link
  link.click();
  toast.success("PAK downloaded successfully !");
  // Release the object URL after download
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (key,setCopySuccess) => {
    try {
      await navigator.clipboard.writeText(key); // Copy key to clipboard
      setCopySuccess(true); // Set success flag
      toast.success("Copied to clipboard !");
      setTimeout(() => setCopySuccess(false), 2000); // Reset success message after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // MissingKey.jsx
export async function saveKey(data,setIsKeyPresent,authUser) {
  if(data===''){
      toast.error('Please enter your PAK !');
      return;
  }
  else if(data.length<120){ 
      toast.error('Invalid PAK length !');
      return;
  }
  else{
  await storeKeyValue(authUser.email.split('@')[0],data);
  await getValueByKey(authUser.email.split('@')[0]);
  toast.success('PAK saved successfully !');
  setIsKeyPresent(true);
  }
}
