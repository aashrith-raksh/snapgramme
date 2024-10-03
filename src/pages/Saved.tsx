import { useEffect, useState } from "react";
import { useGetSavedPosts } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { useUserContext } from "@/contexts/AuthContext";
import { Models } from "appwrite";

const Saved = () => {
  const { user, isAnonymous } = useUserContext();
  const {
    data: savedPosts,
    isPending: isSavedLoading,
    isError: isSavedError,
  } = useGetSavedPosts(user.id);
  const [posts, setPosts] = useState<Models.Document[]>([]);

  useEffect(() => {
    if (isSavedLoading || !savedPosts) return;

    console.log("====== DOCUMENT:", savedPosts);
    const loadedSavedPosts: Models.Document[] = savedPosts!.documents.map(
      (doc) => doc.post
    );
    console.log("====== LOADED SAVED POSTS:", loadedSavedPosts);

    setPosts(loadedSavedPosts);
  }, [isSavedLoading, savedPosts]);

  return (!isSavedLoading && !user) || (!isSavedLoading && isSavedError) ? (
    <p>An error occurred</p>
  ) : (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/save.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
        </div>
        {isAnonymous ? (
          <p>Sign Up to save posts</p>
        ) : isSavedLoading ? (
          <Loader />
        ) : posts.length > 0 ? (
          <div className="flex-grow">
            <GridPostList posts={posts} showUser={true} showStats={true} />
          </div>
        ) : (
          <p>No Saved Posts</p>
        )}
      </div>
    </div>
  );
};

export default Saved;
