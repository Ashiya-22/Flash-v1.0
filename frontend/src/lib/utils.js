import dayjs from "dayjs";

export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

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