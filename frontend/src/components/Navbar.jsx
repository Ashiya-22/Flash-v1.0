import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, Snail, Settings, User,UserRoundSearch } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const Navbar = () => {
  const { authUser } = useAuthStore();
  const {toggleModal,toggleSearchBar} = useChatStore();
  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Snail className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Flash <span className="text-sm font-thin">v1.0</span></h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {authUser && <button className="btn btn-sm gap-2 transition-colors" onClick={toggleSearchBar}>
                  <UserRoundSearch className="size-[1.1rem]" />
                  <span className="hidden sm:inline font-medium">Search</span>
            </button>}

            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-1 items-center" onClick={toggleModal}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline font-medium text-sm">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;