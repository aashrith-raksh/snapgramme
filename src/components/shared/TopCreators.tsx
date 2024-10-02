import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import Loader from './Loader';
import { Link } from "react-router-dom";

const TopCreators = () => {
    const {
      data: creators,
      isLoading: isUserLoading,
      isError: isErrorCreators,
    } = useGetUsers();
  
    return isUserLoading ? (
      <Loader />
    ) : isErrorCreators ? (
      <p>An error occurred</p>
    ) : (
      <section className="hidden lg:block h-screen w-[465px] bg-dark-3">
        <div className="flex flex-col gap-10">
          <div className="px-6 py-12">
            <h2 className="h3-bold md:h2-bold text-left w-full">Top Creators</h2>
          </div>
        </div>
  
        <div className="flex flex-wrap gap-6 justify-between bg-dark-3 min-w-full px-6">
          {creators?.documents.map((creator: Models.Document) => (
            <UserCard creator={creator} />
          ))}
        </div>
      </section>
    );
  };
  
  export const UserCard = ({ creator, classes }: { creator: Models.Document, classes?:string }) => {
    return (
      <div className={`min-h-[190px] min-w-[190px] bg-dark-3 ${classes} rounded-2xl border-off-white/10 border-[1px]`}>
        <div className="flex flex-col px-8 py-6 items-center justify-between gap-4">
          <Link to={""}>
            <img
              src={creator.imageUrl}
              height={54}
              width={54}
              className="rounded-full"
            />
          </Link>
  
          <div className="text-center">
            <p className="text-base">{creator.name}</p>
            <p className="text-xs text-off-white">{creator.username}</p>
          </div>
          <Link
            to={""}
            className="text-xs font-medium text-bold px-4 py-2 bg-primary-500 rounded-md"
          >
            View profile
          </Link>
        </div>
      </div>
    );
  };
  

  export default TopCreators