import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { UserCard } from "@/components/shared/TopCreators";
import { Models } from "appwrite";
import Loader from "@/components/shared/Loader";

const AllUsers = () => {
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
    <div className="max-w-screen w-full px-16 py-16 flex flex-col flex-1 overflow-scroll custom-scrollbar">
      <div className="flex flex-1 mb-12">
        <img src="/assets/icons/people.svg" className="max-h-[38px] w-[38px]" />

        <h2 className="h3-bold md:h2-bold text-left ml-4">All Users</h2>
      </div>

      <div
        className="grid grid-flow-row grid-rows-3 lg:grid-cols-4 lg:gap-10
      grid-cols-3 gap-6 justify-items-stretch align-items-stretch "
      >
        {creators?.documents.map((creator: Models.Document) => (
          <UserCard creator={creator} classes="bg-dark-1" key={creator.$id}/>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
