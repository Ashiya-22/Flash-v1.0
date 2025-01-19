import { Snail } from "lucide-react";
import { useState } from "react";
import { Download } from "lucide-react";
import { downloadFile } from '../lib/utils';
import { useAuthStore } from "../store/useAuthStore";
import { Loader2 } from "lucide-react";

const NoChatSelected = ({keyDownloaded,value,setKeyDownloaded}) => {
  const [isChecked, setIsChecked] = useState(false);
  const { isUpdatingFlag,updateFlag } = useAuthStore();
  const downloadPAK = async (value) => {
    await updateFlag();
    downloadFile(value);
    setKeyDownloaded(true);
  };
  
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-7 sm:p-16 bg-base-100/50 overflow-y-auto">
        {!keyDownloaded?(
          <div className="w-full h-fit mt-6 sm:mt-2 sm:px-4">
          <div className="flex flex-col gap-1">
            <div className="text-xl flex justify-start items-center gap-x-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Snail className="w-8 h-8 text-primary p-1"/></div>
              <span className="text-xl font-bold">Flash <span className="text-sm font-thin">v1.0</span></span></div>
            <div className="font-semibold">Thank you for using Flash !</div>
            <p className="text-sm text-justify mb-2">We sincerely appreciate your trust in Flash. To ensure the best experience, please take note of the following:</p>
            <li className="text-sm text-justify">Your account is secured with <span className="italic">end-to-end encryption</span>, meaning your chats are accessible only to you.</li>
            <li className="text-sm text-justify">However, the above requires the PAK to be in your browser's memory whenever you use our app.</li>
            <li className="text-sm text-justify">Please download your <span className="italic">Private Access Key</span> (PAK). It is crucial for chat recovery.</li>
            <li className="text-sm text-justify">Your PAK can be found in the downloads folder of your primary device.</li>
            <li className="text-sm text-justify">Keep it safe, as it may be required for future access.</li>
            <div className="text-xs text-justify mt-3">Note: Sometimes you may be prompted to enter your PAK. This may happen due to browsing in incognito mode, clearing browser cache, using a different browser or device. You can find your PAK in the downloads folder of your primary device.</div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={isChecked}
                onChange={(event) => setIsChecked(event.target.checked)}
                className="cursor-pointer w-4 h-4"
              />
              <label htmlFor="terms" className="text-sm font-semibold">I have read and understood the above.</label>
            </div>
            <button className="w-fit focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 mt-3 disabled:cursor-not-allowed flex gap-2 justify-center items-center transition-all ease-in-out duration-300 disabled:opacity-80" disabled={!isChecked || isUpdatingFlag} onClick={() => downloadPAK(value)}>{isUpdatingFlag ? (
                <>
                Downloading PAK<Loader2 className="h-5 w-5 animate-spin" />
                </>
              ) : (
                <>Download PAK<Download className='w-5 h-5'/></>
              )}</button>
          </div>
          </div>
        ):(
          <div className="max-w-md text-center">
          {/* Icon Display */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
              justify-center"
              >
              <Snail className="w-8 h-8 text-primary " />
              </div>
            </div>
          </div>
          {/* Welcome Text */}
          <h1 className="text-2xl font-bold">Welcome to <span className="text-2xl font-bold">Flash <span className="text-sm font-medium">v1.0</span></span></h1>
          <p className="text-base-content/60 mt-2">
            Select a contact to start your chat in a flash !
          </p></div>)}
      </div>
  );
};

export default NoChatSelected;