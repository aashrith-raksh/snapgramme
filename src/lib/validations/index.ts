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
