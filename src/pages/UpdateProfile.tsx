import { useUserContext } from "@/contexts/AuthContext";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Link } from "react-router-dom";
import EditProfileForm from "@/components/forms/EditProfileForm";

const EditProfile = () => {
  const { user } = useUserContext();
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <div className="flex gap-4 w-full justify-start items-center max-w-5xl">
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile pic"
            className="rounded-full h-24 w-24 object-cover"
          />
          <p className="text-link-blue font-semibold">Change profile photo</p>
        </div>

        <EditProfileForm />
      </div>
      <TopPosts />
    </div>
  );
};

export default EditProfile;



const TopPosts = () => {
  const {
    data: posts,
    isLoading: isPostsLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  const { user, isAnonymous } = useUserContext();

  return isPostsLoading ? (
    <Loader />
  ) : isErrorPosts ? (
    <p>An error occurred</p>
  ) : (
    <section className="hidden lg:block h-screen max-w-[465px] bg-dark-1 px-11 overflow-scroll custom-scrollbar">
      <div className="flex flex-col gap-6 items-center mt-20">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="profile"
          className="h-[130px] w-[130px] rounded-full object-cover"
        />
        <div className="flex flex-col gap-3 items-center">
          <h1 className="text-3xl font-bold">
            {isAnonymous ? "Guest" : user?.name}
          </h1>
          <p className="small-regular text-light-3">
            @{isAnonymous ? "guest" : user?.username}
          </p>
        </div>
      </div>

      <h3 className="font-semibold text-xl mt-14 mb-7">
        {isAnonymous ? "Popular posts" : "Top posts by you"}
      </h3>

      <ul className="w-full grid grid-cols-1 gap-8">
        {posts?.documents.map((post) => {
          return (
            <li key={post.$id} className="relative min-w-80 h-80">
              <Link to={`/posts/${post.$id}`} className="grid-post_link">
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="grid-post_user">
                <div className="flex items-center justify-start gap-2 flex-1">
                  <img
                    src={
                      post.creator.imageUrl ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt="creator"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <p className="line-clamp-1">{post.creator.name}</p>
                </div>

                <PostStats post={post} userId={user.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
