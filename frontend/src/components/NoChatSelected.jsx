import { Snail } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
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
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;