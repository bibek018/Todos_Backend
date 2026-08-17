import mongoose from "mongoose";
export const dbConnection=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully to MongoDB");

    }
    catch(err)
    {
        console.log(err.message);
        process.exit(1); 
    }
}