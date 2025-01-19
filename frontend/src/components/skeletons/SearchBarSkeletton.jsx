import Skeleton from "react-loading-skeleton";
const SearchBarSkeletton = () => {
  return (
    <div className="flex flex-col items-start gap-3">
      {[...Array(3)].map((_, index) => 
      (
        <div className="flex items-center justify-center gap-2 bg-base-100 px-5 py-3 rounded-md" key={index}>
        <Skeleton circle width={40} height={40}/>
        <Skeleton width={160} height={20}/></div>
      ))
      }
    </div>
  );
}

export default SearchBarSkeletton;