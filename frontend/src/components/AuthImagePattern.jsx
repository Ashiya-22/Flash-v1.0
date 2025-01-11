import { MessageSquareMore, Heart, Smile, Bell, Snail } from "lucide-react";
import {images} from "../shared/AuthImageArray";

const AuthImagePattern = ({ title, subtitle }) => {
    return (
      <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
        <div className="max-w-sm text-center">
        <div className="grid grid-cols-3 gap-3 scale-75">
          {[...Array(9)].map((_, i) => (
            <div
            key={i}
            className={`aspect-square rounded-2xl bg-primary/10 flex items-center justify-center ${
            i % 2 === 0 && i!==4 ? "animate-pulse" : ""
            }`}
            >
              {i % 2 === 0 ? (
              // Icons for even-indexed squares
              <>
                {i === 0 && <MessageSquareMore className="text-yellow-500 w-10 h-10" />}
                {i === 2 && <Heart className="text-red-500 w-10 h-10" />}
                {i === 4 && 
                  <div className="flex flex-col justify-center items-center">
                    <Snail className="text-primary w-10 h-10"/>
                    <h1 className="text-md font-bold">Flash <span className="text-sm font-thin">v1.0</span></h1>
                  </div>
                }
                {i === 6 && <Smile className="text-green-500 w-10 h-10" />}
                {i === 8 && <Bell className="text-blue-500 w-10 h-10" />}
              </>
              ) : images[Math.floor(i / 2)] ? (
                // Images for odd-indexed squares
                <img
                  src={images[Math.floor(i / 2)]}
                  alt={`Image ${i}`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : null}
            </div>
          ))}
        </div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-base-content/80">{subtitle}</p>
        </div>
      </div>
    );
  };
  
  export default AuthImagePattern;