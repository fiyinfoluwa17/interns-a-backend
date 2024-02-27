import  Express  from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

const app = Express();
dotenv.config();

app.use(morgan("dev"));

const dbUrl = process.env.MONGODB_URL
// console.log(dbUrl);


const connect = (url)=>{
    mongoose.connect(url)
    .then(()=>console.log("DB connected succesfully"))
    .catch((err) => console.log("Error connecting to DB", err))
}
connect(dbUrl)
app.get('/', (req, res) => {
    res.json({
        message: 'Successful!',
        status: 200,
        name: 'success',
        age: 20,
        skills: ['HTML', 'CSS', 'javascript']
    })
})

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})