import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Modal from "../components/Modal";
import { useAuthStore } from "../store/useAuthStore";
import { useState,useEffect,useRef } from "react";
import { getValueByKey } from "../keys/key";
import MissingKey from "../components/MissingKey";
import SearchBar from "../components/SearchBar";

const HomePage = () => {
  const [isKeyPresent, setIsKeyPresent] = useState(true);
  const { selectedUser,searchBar,toggleSearchBar } = useChatStore();
  const { authUser }=useAuthStore();
  const keyName=authUser.email.split('@')[0];
  const value = sessionStorage.getItem(keyName);
  const defaultState=authUser.hasDownloadedKey;
  const [keyDownloaded, setKeyDownloaded] = useState(defaultState);
  const props={ keyDownloaded, value, setKeyDownloaded };
  const searchBarRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      toggleSearchBar(); // Close the search bar if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const fetchKey = async () => {
      await getValueByKey(keyName);
      if (value.length === 4) {
        setIsKeyPresent(false);
      } else {
        setIsKeyPresent(true);
      }
    }
    fetchKey();
  }, [value]);

  return (
    <div className="h-screen bg-base-200 relative">
     {searchBar && <><div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10 animate-fadeIn"></div>
    <SearchBar searchBarRef={searchBarRef}/></>
     }
      <div className="flex items-center justify-center pt-24 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden relative">
            <Sidebar keyDownloaded={keyDownloaded}/>
            {!selectedUser ? <NoChatSelected {...props}/> : <ChatContainer/>}
            {!isKeyPresent && <MissingKey setIsKeyPresent={setIsKeyPresent}/>}
          </div>
        </div>
      </div>
      <Modal/>
    </div>
  );
};
export default HomePage;