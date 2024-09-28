import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { INewPost, INewUser } from "../types";
import {
  createPost,
  createUserAccount,
  getRecentPosts,
  signInUser,
  signOutUser,
} from "../appwrite/api";
import { QUERY_KEYS } from "./queryKeys";

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (userDetails: INewUser) => createUserAccount(userDetails),
  });
};
export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (userCredentials: { email: string; password: string }) =>
      signInUser(userCredentials),
  });
};
export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutUser,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
}
