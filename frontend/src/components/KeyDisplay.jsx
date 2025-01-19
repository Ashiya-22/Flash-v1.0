import React, { useState } from 'react';
import { EyeOff,Eye, Clipboard,ClipboardCheck,Download } from 'lucide-react';
import { copyToClipboard } from '../lib/utils';
import { downloadFile } from '../lib/utils';

const KeyDisplay = ({privateKey}) => {
  const key = privateKey; // Replace with your dynamic key
  const [copySuccess, setCopySuccess] = useState(false);
  const [showKey,setShowKey]=useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2 rounded-lg">
      <div className="w-full relative">
        <input
          type={showKey?("text"):("password")}
          value={key}
          readOnly
          className="w-full py-2 px-3 bg-base-200 rounded-md text-zinc-400 font-medium text-sm cursor-pointer focus:outline-none"
        />
        <button className='absolute top-1.5 right-1 bg-base-200 px-2 focus:outline-none' onClick={() => setShowKey(prevState => !prevState)} >
          {showKey?(<Eye className="w-[1.2rem]"/>):(<EyeOff className="w-[1.2rem]"/>)}
        </button>
      </div>

      <div className='min-w-[6rem] flex items-center text-zinc-300'>
        <button
          onClick={() => copyToClipboard(key,setCopySuccess)}
          className="w-[40%] py-[0.35rem] px-[0.6rem] bg-green-600 rounded-tl-md rounded-bl-md hover:text-white transition-all ease-in-out duration-200"
        >
          {copySuccess ? (
            <ClipboardCheck className='w-[1.2rem]'/>
          ) : (
            <Clipboard className='w-[1.2rem]'/>
          )}
        </button>
        <button className='w-[40%] py-[0.35rem] px-[0.6rem] bg-primary rounded-tr-md rounded-br-md hover:text-white transition-all ease-in-out duration-200' onClick={() => downloadFile(key)}>
          <Download className='w-[1.2rem]'/>
        </button>
      </div>
    </div>
  );
};

export default KeyDisplay;
