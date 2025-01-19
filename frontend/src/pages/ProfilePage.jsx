import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import avatar_image from "../assets/avatar.png";
import Modal from "../components/Modal";
import { useChatStore } from "../store/useChatStore";
import { Info,TriangleAlert,KeyRound } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import KeyDisplay from "../components/KeyDisplay.jsx";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile,isDeleting } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const {toggleModal,setModalFlag} = useChatStore();
  const keyName=authUser.email.split('@')[0];
  const privateKey=sessionStorage.getItem(keyName);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  if (isDeleting)
    return (
      <div className="flex flex-col gap-1 items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin" />
        <div className='animate-pulse text-md font-normal'>Loading</div>
      </div>
  );

  return (
    <div className="h-fit pt-20 pb-12">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-200 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || avatar_image}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click on the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6 px-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-md font-medium  mb-4 flex gap-2 items-center"><Info className="w-[1.1rem] h-[1.1rem]"/>Account information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-md font-medium  mb-4 flex gap-2 items-center"><KeyRound className="w-[1.1rem] h-[1.1rem]"/>Private Access Key</h2>
            <div>
                <KeyDisplay privateKey={privateKey}/>
            </div>
          </div>
        </div>
        <div className="bg-base-300 rounded-xl px-12 py-10 mt-8">
            <h2 className="text-md font-medium  mb-1 flex gap-2 items-center"><TriangleAlert className="w-[1.1rem] h-[1.1rem]"/>Delete your account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between py-2 gap-6">
                <span className="text-justify">This will result in the permanent removal of your account and all associated data.</span>
                <button className="bg-red-600 text-white px-10 sm:px-6 text-md py-2 rounded-md hover:bg-red-700 transition-all ease-in-out duration-300" onClick={()=>{
                  toggleModal();
                  setModalFlag(0);
                }}>Delete</button>
              </div>
            </div>
          </div>
      </div>
      <Modal/>
    </div>
  );
};
export default ProfilePage;