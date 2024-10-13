import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  INewMessage,
  INewPost,
  INewUser,
  IUpdateConversation,
  IUpdatePost,
  IUpdateProfile,
} from "../types";
import {
  createPost,
  createUserAccount,
  deletePost,
  deleteSavedPost,
  fetchDummyUsers,
  findUserByUsername,
  getConversationsMessages,
  getCurrentUser,
  getInfinitePosts,
  getPostById,
  getRecentConversations,
  getRecentPosts,
  getSavedPosts,
  getUserPosts,
  getUsers,
  likePost,
  savePost,
  searchPosts,
  sendMessage,
  signInUser,
  signOutUser,
  updatePost,
  updateProfile,
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
    mutationFn: (sessionId: string) => signOutUser(sessionId),
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
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SAVED_POSTS],
      });
    },
  });
};

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts as any,
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      // If there's no data, there are no more pages.
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      // Use the $id of the last document as the cursor.
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};
export const useGetSavedPosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_SAVED_POSTS, userId],
    queryFn: () => getSavedPosts(userId),
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};
export const useFetchDummyUsers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_DUMMY_USERS],
    queryFn: fetchDummyUsers,
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useFindUserByUsername = (userName: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_USERNAME, userName],
    queryFn: () => findUserByUsername(userName),
    enabled: !!userName,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (details: {
      newUserProfileDetails: IUpdateProfile;
      userId: string;
    }) => {
      const { newUserProfileDetails, userId } = details;
      const updatedProfile = await updateProfile(newUserProfileDetails, userId);
      return updatedProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// ============================================================
// MESSAGE MUTATTIONS & QUERIES
// ============================================================

export const useGetRecentConversations = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_CONVERSATIONS, userId],
    queryFn: () => getRecentConversations(userId),
    enabled: !!userId,
  });
};

export const useGetConversationMessages = (conversationId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONVERSATION_MSGS, conversationId],
    queryFn: () => {
      return getConversationsMessages(conversationId);
    },
    enabled: !!conversationId,
  });
};

export const useSendMessageMutation = () => {
  return useMutation({
    mutationFn: ({
      msgData,
      convoDataToUpdate,
      isAnonymous,
    }: {
      msgData: INewMessage;
      convoDataToUpdate: IUpdateConversation;
      isAnonymous: boolean;
    }) => sendMessage(msgData, convoDataToUpdate, isAnonymous),
  });
};
