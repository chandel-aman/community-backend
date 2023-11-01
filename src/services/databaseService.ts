import mongoose from 'mongoose';

export async function connectToDatabase() {
    await mongoose.connect(process.env.MONGO_URI as string).then(()=>{
        console.info("Connected to MongoDB database");
    }).catch((error:any)=>{
        console.error(error);
    })
}
