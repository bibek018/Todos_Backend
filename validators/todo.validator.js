import {z} from "zod";
export const validtodoSchema = z.object({
    title:z.string().min(8,"Title must be of minium length 8"),
}).strict();

export const validtodoUpdateSchema = z.object({
    title:z.string().min(8, "Title must be of minimum length 8"),
    status:z.enum(["not started", "completed", "in progress"], ("Incorrect status chosen "))
}).strict();