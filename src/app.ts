import express from 'express';
import employeeRoutes from './routes/employee'
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({credentials:true}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/',employeeRoutes)


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});