import { editProfileSchema } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useGetCurrentUser,
  useUpdateProfileMutation,
} from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/hooks/use-toast";
import AlertDialogWrapper from "@/components/shared/AlertDialogWrapper";
import { useUserContext } from "@/contexts/AuthContext";

const EditProfileForm = () => {
  const { data: user, isPending: isLoadingUser } = useGetCurrentUser();
  const { toast } = useToast();
  const {
    mutateAsync: updateProfie,
    isPending: isUpdatingProfile,
    isError: isErrorUpdating,
  } = useUpdateProfileMutation();

  const { isAnonymous } = useUserContext();

  const form = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || (isAnonymous ? "Guest" : ""),
      username: user?.username || (isAnonymous ? "guest" : ""),
      email: user?.email || (isAnonymous ? "guest@gmail.com" : ""),
      bio: user?.bio || (isAnonymous ? "This is a guest user's bio" : ""),
    },
  });

  async function onSubmit(values: z.infer<typeof editProfileSchema>) {
    // console.log("SUBMITTED");
    const newUserProfileDetails = { ...values };
    const updatedProfile = await updateProfie({
      newUserProfileDetails,
      userId: user!.$id,
    });

    if (!updatedProfile || isErrorUpdating) {
      toast({
        variant: "destructive",
        title: `Updating profile details failed. Please try again.`,
      });

      return;
    }

    toast({
      variant: "destructive",
      title: `Profile details updated`,
    });

    return;
  }

  return (
    <>
      {isLoadingUser && <Loader />}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-9 w-full  max-w-5xl"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Art, Expression, Learn"
                    type="email"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Bio</FormLabel>
                <FormControl>
                  <Textarea
                    className="shad-textarea custom-scrollbar"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <div className="flex gap-4 items-center justify-end">
            <Button type="button" className="shad-button_dark_4">
              Cancel
            </Button>
            {isAnonymous ? (
              <AlertDialogWrapper
                title={"Sign Up to Update Your Profile"}
                description={
                  "Create an account to update your profile information"
                }
              >
                <Button
                  type="submit"
                  className="shad-button_primary whitespace-nowrap"
                >
                  Update
                </Button>
              </AlertDialogWrapper>
            ) : (
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile && <Loader />}
                Update
              </Button>
            )}
          </div>
        </form>
      </Form>
    </>
  );
};

export default EditProfileForm;
