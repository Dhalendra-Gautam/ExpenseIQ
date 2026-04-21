import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = 4000;

//MIDDLEWARES


//DB


//ROUTES
app.get('/', (req, res) => {
    res.send("API Working");
})

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})