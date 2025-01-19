import { Eye,EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import avatar_image from "../assets/avatar.png";
import { useState } from "react";
import { saveKey } from "../lib/utils";

const MissingKey = ({setIsKeyPresent}) => {
    const { authUser }=useAuthStore();
    const [showKey,setShowKey]=useState(false);
    const [data,setData]=useState('');
    return (
        <div className="w-full h-full absolute left-0 top-0 bg-base-200 animate-fadeIn z-50">
            <div className="flex items-center justify-center h-full w-full">
                <div className="w-[35rem] h-[26rem] bg-base-300 rounded-md mx-5 flex flex-col gap-y-4 items-center justify-around px-4 py-6">
                    <div className="text-lg lg:text-xl font-semibold flex gap-x-2 items-center justify-center animate-pulse">Missing Private Access Key (PAK)</div>
                    <div className="flex flex-col gap-y-1 items-center justify-center">
                        <img src={authUser.profilePic || avatar_image} className="w-[3.8rem] h-[3.8rem] rounded-full"/>
                        <div className="text-bold text-md">{authUser.fullName}</div>
                    </div>
                    <div className="relative mt-1">
                        <input
                            type={showKey?("text"):("password")}
                            placeholder="Please enter your PAK"
                            className="w-[19rem] sm:w-[21rem] py-2 px-3 bg-base-200 rounded-md font-light text-sm cursor-pointer focus:outline-none"
                            onChange={(e) => setData(e.target.value)}
                        />
                        <button className='absolute top-1.5 right-1 bg-base-200 px-2 focus:outline-none' onClick={() => setShowKey(prevState => !prevState)} >
                            {showKey?(<Eye className="w-[1.2rem]"/>):(<EyeOff className="w-[1.2rem]"/>)}
                        </button>
                    </div>
                    <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 font-medium rounded-lg text-sm px-8 py-2 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 transition-all ease-in-out duration-300" onClick={()=>saveKey(data,setIsKeyPresent,authUser)}>Proceed</button>
                    <p className="text-xs text-zinc-400 text-center mx-3">
                        Note: This may happen due to browsing in incognito mode, clearing browser cache, using a different browser or device. You can find your PAK in the downloads folder of your primary device.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MissingKey;
