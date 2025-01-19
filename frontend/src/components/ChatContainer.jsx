import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import avatar_image from "../assets/avatar.png";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import dayjs from "dayjs";
import { MessagesSquare } from "lucide-react";
import LoadingBar, {LoadingBarContainer} from "react-top-loading-bar";
import { MessageCircleWarning } from "lucide-react";

const ChatContainer = () => {
  const {
    groupedMessages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    hasMore
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const[isAtTop,setIsAtTop]=useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();
    
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    if (!isAtTop && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupedMessages]);

  const handleScroll = async () => {
    if (
      hasMore && scrollContainerRef.current.scrollTop === 0 &&
      !isMessagesLoading
    ) {
      // Fetch more messages when scrolled to the top
      setIsAtTop(true);
      setProgress(progress + 40);
      await getMessages(selectedUser._id);
      setProgress(100);
      scrollContainerRef.current.scrollTop = 1;
    }

    if(scrollContainerRef.current.scrollTop > 0){
      setIsAtTop(false);
    }
  };

  if (isMessagesLoading && !Object.keys(groupedMessages).length) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {Object.keys(groupedMessages).length === 0 && 
        <div className="self-center flex flex-col items-center justify-center absolute top-[40%] gap-y-2">
            <MessagesSquare className="size-16 text-primary"/>
            <div className="text-zinc-400">Get started with your first message !</div>
        </div>
      }
      
      <LoadingBarContainer>
        <LoadingBar
        color="#36d7b7"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
        shadow={true}
        height={3}
        />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        {!hasMore && Object.keys(groupedMessages).length !== 0 && <div className="flex justify-center items-center animate-fadeIn">
            <span className="text-center text-sm text-white px-5 py-1 bg-primary rounded-full opacity-95">
            You’ve reached the end of this chat
            </span>
          </div>}
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className="space-y-2">
            {/* Date Header */}
            <div className="text-center text-sm font-semibold text-gray-500">
            {
              dayjs(date, 'D MMMM YYYY').isSame(dayjs(), 'day')
              ? 'Today'
              : dayjs(date, 'D MMMM YYYY').isSame(dayjs().subtract(1, 'day'), 'day')
              ? 'Yesterday'
              : date 
            }
            </div>

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message._id}
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
                ref={messageEndRef}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || avatar_image
                          : selectedUser.profilePic || avatar_image
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-[0.05rem]">
                  <time className="text-xs opacity-50 ml-1">
                    {dayjs(message.createdAt).format("h:mm A")}
                  </time>
                </div>
                <div
                  className={`chat-bubble ${message.qC?(`${
                    message.senderId === authUser._id
                      ? "chat-bubble-primary"
                      : ""}`):("bg-red-500 text-white")}
                  } flex flex-col`}
                >
                  {(message.image && message.qC) && 
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  }
                  {(message.text && message.qC) && <p className="text-white">{message.text}</p>}

                  {((message.image || message.text) && !message.qC) && <p className="flex justify-center items-center gap-1 text-sm md:text-base"><MessageCircleWarning className="animate-pulse w-5 md:w-6"/>Breached Message</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      </LoadingBarContainer>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;

