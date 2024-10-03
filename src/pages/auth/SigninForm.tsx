import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

("use client");

import { Link, useNavigate } from "react-router-dom";
import { signInValidationSchema } from "@/lib/validations";
import { z } from "zod";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/hooks/use-toast";
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/contexts/AuthContext";
import { account } from "@/lib/appwrite/config";
import { createGuestUser, deleteGuestUser } from "@/lib/utils";

const SignInForm = () => {
  const { toast } = useToast();

  const { checkAuthUser, setIsAnonymous } = useUserContext();

  const navigate = useNavigate();

  const {
    mutateAsync: signInUser,
    isPending: isSigningInUser,
    isError: isErrorInSignIn,
  } = useSignInAccount();

  const form = useForm<z.infer<typeof signInValidationSchema>>({
    resolver: zodResolver(signInValidationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInValidationSchema>) {
    const session = await signInUser({
      email: values.email,
      password: values.password,
    });

    if (isErrorInSignIn || !session) {
      console.log("Invalid session");
      toast({
        variant: "destructive",
        title: "Sing in failed. Please try again.",
      });
      return;
    }

    console.log("\nuser session created".toUpperCase());
    console.log("session: ", session);

    const isLoggedIn = await checkAuthUser();

    if (isLoggedIn) {
      console.log("\nlogged In....Redirectig to Homepage");
      navigate("/");
    } else {
      toast({
        variant: "destructive",
        title: "User not authenticated. Please try again.",
      });

      return;
    }
  }

  async function createGuestAccount(
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> {

    event.preventDefault();
    const anonymousSession = await account.createAnonymousSession();
    console.log("============== ANONYMOUS SESSION:",anonymousSession);
    
    createGuestUser();
    setIsAnonymous(true);
    
    navigate("/");
  }


//--note: remove the below funcs. before commiting
  async function handleLogout() {
    try {
      const deletedSession = await account.deleteSession("current");
      console.log("============== DELETED SESSION:", deletedSession);

      deleteGuestUser();
      setIsAnonymous(false);

      console.log(deletedSession);
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }
  async function handleGetCurrentUser() {
    try {
      const curentUser = await account.get();
      console.log("==============CURRENT USER:", curentUser);
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  return (
    <div className="sm:w-420 flex-center flex-col">
      <img src="/assets/images/logo.svg" alt="logo" />

      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-8">Welcome back</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">
        Enter your details to log in
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-[90%] mt-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    type="email"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Password"
                    type="password"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isSigningInUser ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Log In"
            )}
          </Button>
          <Button
            type="button"
            onClick={createGuestAccount}
            className="border-primary-500 border-[1px]"
          >
            Continue as a guest
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Don't have an account?
            <Link
              to="/signup"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Sign up
            </Link>
          </p>
        </form>
      </Form>

      <button
        type="button"
        className="font-medium text-sm text-primary-500 mt-6 underline underline-offset-4"
        onClick={handleLogout}
      >
        Logout
      </button>

      <button
        type="button"
        className="font-medium text-sm text-primary-500 mt-6 underline underline-offset-4"
        onClick={handleGetCurrentUser}
      >
        Get current user
      </button>
    </div>
  );
};

export default SignInForm;
