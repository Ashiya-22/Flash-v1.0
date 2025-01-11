import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import avatar_image from "../assets/avatar.png";
import { ShieldCheck } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser,encryptFlag,defaultEncryptFlag } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || avatar_image } alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User name */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-x-1 justify-center">
          <ShieldCheck className={`${encryptFlag?("text-green-500"):("text-red-500")} w-5 h-5`}/>
          <div className="text-zinc-500 text-md">End-to-end encrypted</div>
        </div>

        {/* Close button */}
        <button className="mr-2 hover:bg-primary p-[0.2rem] rounded-full transition-all duration-300" onClick={() => {
          setSelectedUser(null);
          defaultEncryptFlag();
        }}>
          <X className="hover:text-white"/>
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
