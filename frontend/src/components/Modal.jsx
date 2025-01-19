import { useState } from 'react';
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore';
import { TriangleAlert } from 'lucide-react';
import toast from "react-hot-toast";

const Modal = () => {
  const {isOpen,toggleModal,modalFlag,setModalFlag}=useChatStore();
  const { logout,authUser,deleteProfile } = useAuthStore();
  const [text, setText] = useState("");

  const deleteAccount= ()=>{
    if(authUser.fullName!==text){
      toast.error("Text doesn't match, try again !");
    }else{
      deleteProfile();
      toggleModal();
    }
  };

  return (
    <>
    {isOpen &&
    <div className='h-full w-full bg-[#00000083] fixed top-0 left-0 animate-fadeIn z-50'>
    <div className='h-full w-full flex justify-center items-center'>
        <div className="flex items-center justify-center">
          <div className="bg-neutral rounded-lg shadow-lg max-w-96 p-8 mx-6">
            <div className="flex gap-2 justify-start items-center">
              <TriangleAlert className='w-6 h-6 text-yellow-400 animate-pulse'/><span className="text-lg font-semibold text-white">Confirm {modalFlag?("Logout"):("Deletion")}</span>
            </div>
            {modalFlag ? (<p className="mt-4 text-sm text-white">
              Are you sure you want to logout? You will need to log in again to access your account.
            </p>):(<p className="mt-4 text-sm text-white">
              To delete your account, type <span className='font-bold'>{authUser.fullName}</span> and press confirm.
            </p>)}
            {!modalFlag && <input
            type="text"
            className="w-full rounded-lg px-3 py-2 mt-4"
            placeholder={authUser.fullName}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />}
            <div className="mt-6 flex justify-between items-center space-x-3">
              <button
                className="px-4 py-[0.4rem] bg-red-600 text-white font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                onClick={()=>{
                  if(modalFlag){
                    logout();
                    toggleModal();
                  }else{
                    deleteAccount();
                  }
                }}
              >
                {modalFlag?("Logout"):("Confirm")}
              </button>

              <button
                className="px-4 py-[0.4rem] bg-gray-300 text-gray-800 font-medium rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={()=>{
                  toggleModal();
                  setModalFlag(1);
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
    </div>
    </div>
    }
    </>
  )
}

export default Modal