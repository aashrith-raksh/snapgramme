import { useUserContext } from "@/contexts/AuthContext";
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
  useGetRecentPosts,
  useUpdateProfileMutation,
} from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
            src={user.imageUrl}
            width={100}
            height={100}
            alt="profile pic"
            className="rounded-full"
          />
          <p className="text-link-blue font-semibold">Change profile photo</p>
        </div>

        <EditProfileForm />
      </div>
      {/* TOP POSTS SIDEBAR */}
      <TopPosts />
    </div>
  );
};

export default EditProfile;

const EditProfileForm = () => {
  const { data: user, isPending: isLoadingUser } = useGetCurrentUser();
  const { toast } = useToast();
  const {
    mutateAsync: updateProfie,
    isPending: isUpdatingProfile,
    isError: isErrorUpdating,
  } = useUpdateProfileMutation();

  const form = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
    },
  });

  async function onSubmit(values: z.infer<typeof editProfileSchema>) {
    console.log("SUBMITTED");
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
            <Button
              type="submit"
              className="shad-button_primary whitespace-nowrap"
              disabled={isUpdatingProfile}
            >
              {(isUpdatingProfile) && <Loader />}
              Update
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

const TopPosts = () => {
  const {
    data: posts,
    isLoading: isPostsLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  const { user } = useUserContext();

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
          className="h-[130px] w-[130px] rounded-full "
        />
        <div className="flex flex-col gap-3 items-center">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="small-regular text-light-3">@{user.username}</p>
        </div>
      </div>

      <h3 className="font-semibold text-xl mt-14 mb-7">Top posts by you</h3>

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
                    className="w-8 h-8 rounded-full"
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
function checkAuthUser() {
  throw new Error("Function not implemented.");
}
