import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { INewUser } from "../types";
import { createUserAccount, signInUser, signOutUser } from "../appwrite/api";


export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (userDetails: INewUser) => createUserAccount(userDetails)
    })
}
export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (userCredentials: {email: string, password: string}) => signInUser(userCredentials)
    })
}
export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutUser
    })
}
