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
import { signUpValidationSchema } from "@/lib/validations";
import { z } from "zod";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateUserAccount,
  useSignInAccount,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/contexts/AuthContext";
import { createGuestUser } from "@/lib/utils";
import { account } from "@/lib/appwrite/config";
import { useState } from "react";

const SignUpForm = () => {
  const { toast } = useToast();
  const {
    mutateAsync: createUserAccount,
    isPending: isCreatingUser,
    isError: isErrorInCreatingUserAccount,
  } = useCreateUserAccount();

  const { mutateAsync: signInUser, isError: isErrorInSignIn } =
    useSignInAccount();

  const { checkAuthUser, setIsAnonymous } = useUserContext();

  const navigate = useNavigate();

  const [isCreatingGuestAccount, setIsCreatingGuestAccount] = useState(false)

  const form = useForm<z.infer<typeof signUpValidationSchema>>({
    resolver: zodResolver(signUpValidationSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpValidationSchema>) {
    const newUserInDB = await createUserAccount(values);

    if (isErrorInCreatingUserAccount || !newUserInDB) {
      toast({
        variant: "destructive",
        title: "Sing up failed. Please try again.",
      });
      return;
    }
    // console.log("User saved to DB successfully");

    const session = await signInUser({
      email: values.email,
      password: values.password,
    });

    if (isErrorInSignIn || !session) {
      // console.log("Invalid session");
      toast({
        variant: "destructive",
        title: "Sing in failed. Please try again.",
      });
      return;
    }

    // console.log("\nsession: ", session);
    // console.log("user session created");

    const isLoggedIn = await checkAuthUser();

    if (isLoggedIn) {
      // console.log("\nlogged In....Redirectig to Homepage");
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
    try {
      setIsCreatingGuestAccount(true)
      const anonymousSession = await account.createAnonymousSession();
      // console.log("============== ANONYMOUS SESSION:", anonymousSession);
  
      createGuestUser();
      setIsAnonymous(true);
  
      navigate("/");
    } catch (error) {
      if(error instanceof Error){
        console.log(error.message)
      }
      
    }finally{
      setIsCreatingGuestAccount(false)

    }
  }

  return (
    <div className="sm:w-420 flex-center flex-col">
      <img src="/assets/images/logo.svg" alt="logo" />

      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-8">Create a new account</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">
        To use Snapgram, Please enter your details
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-[90%] mt-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Username"
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
            {isCreatingUser ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>
          <Button
            type="button"
            onClick={createGuestAccount}
            className="border-primary-500 border-[1px]"
          >
            Continue as a guest {isCreatingGuestAccount && <Loader/>}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?
            <Link
              to="/signin"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Log in
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
