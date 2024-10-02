import { useEffect, useState } from "react";
import saveIcon from "../../public/assets/icons/save.svg";
import {
  useGetSavedPosts,
} from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { useUserContext } from "@/contexts/AuthContext";
import { Models } from "appwrite";

const Saved = () => {
  const { user } = useUserContext();
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
    <div className="max-w-screen w-full px-16 py-16 flex flex-col ">
      <div className="flex flex-grow-0 mb-16">
        <img src={saveIcon} className="max-h-[38px] w-[38px]" />

        <h2 className="h3-bold md:h2-bold text-left ml-4">Saved Posts</h2>
      </div>
      {isSavedLoading ? (
        <Loader />
      ) : posts.length > 0 ? (
        <div className="flex-grow">
        <GridPostList posts={posts} showUser={true} showStats={true} />
      </div>
      ) : (
        <p>No Saved Posts</p>
      )}
    </div>
  );
};

export default Saved;
