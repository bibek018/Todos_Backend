import {z} from "zod";
export const signupSchema = z.object({
    name:z.string().min(3, "Name must be minimum of 3 letters."),
    email:z.string().email("Invalid email address"),
    password:z.string().min(8, "Password must be minimum of length 8")
});

export const signinSchema = z.object({
    email:z.string().email("Invalid email address"),
    password:z.string().min(8,"Password must be of minimum length 8")
})