import { z } from "zod";

export const signUpValidationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "First Name must be atleast 2 characters" }),
  username: z
    .string()
    .min(2, { message: "Username must be atleast 2 characters" }),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Username must be atleast 2 characters" }),
});

export const signInValidationSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Username must be atleast 2 characters" }),
});

export const postSchema = z.object({
  caption: z
    .string()
    .min(5, { message: "Minimum 5 characters." })
    .max(2200, { message: "Maximum 2,200 caracters" }),
  file: z.custom<File[]>(),
  location: z
    .string()
    .min(1, { message: "This field is required" })
    .max(1000, { message: "Maximum 1000 characters." }),
  tags: z.string(),
});

export const editProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "First Name must be atleast 2 characters" }),
  username: z
    .string()
    .min(2, { message: "Username must be atleast 2 characters" }),
  email: z.string().email(),
  bio: z.string().max(2200, "Bio can't be more than 2200 character"),
});
