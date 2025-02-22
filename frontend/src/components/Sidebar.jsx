import { useEffect, useState,useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import avatar_image from "../assets/avatar.png";
import { X } from "lucide-react";

const Sidebar = ({keyDownloaded}) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading,defaultEncryptFlag } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
 
  const commonCount = useMemo(() => {
    const onlineSet = new Set(onlineUsers);
    return users.filter((user) => onlineSet.has(user._id)).length;
  }, [onlineUsers, users]); // Dependencies

  useEffect(() => {
    getUsers();
  }, [getUsers]);
  
  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 relative">
      {!keyDownloaded && <div className="w-full h-full absolute top-0 left-0 bg-base-100 z-30 opacity-50"></div>}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Filter</span>
          </label>
          <span className="text-xs text-zinc-500">({commonCount} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => { 
              setSelectedUser(user);
              defaultEncryptFlag();
              }
            }
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors disabled:cursor-not-allowed
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
            disabled={selectedUser?._id === user._id?(true):(false)}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || avatar_image }
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) ? (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-1 ring-zinc-900"
                />) : (<span className="absolute bottom-0 flex items-center justify-center right-0 size-3 bg-white
                  rounded-full ring-1 ring-zinc-900"><X className="w-full text-gray-700"/></span>
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && showOnlineOnly && (
          <div className="text-center text-zinc-500 py-4 animate-fadeIn">No online users</div>
        )}

        {users.length === 0 && !showOnlineOnly &&(
          <div className="text-center text-zinc-500 py-4 animate-pulse">Let's start making friends :&#41;</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;