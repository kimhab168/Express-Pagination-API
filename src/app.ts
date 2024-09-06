import express, { Request, Response, NextFunction } from "express";
import { checkInputValidation } from "./middlewares/inputValidation";
import { productSchema } from "./middlewares/inputValidation";
import { handleError } from "./middlewares/handleErrors";
import {
  createData,
  deleteByID,
  getAllData,
  getByID,
  updateByID,
} from "./controllers/controllersAPI";
const app = express();

//Middleware to parse JSON requests
app.use(express.json());

//==========================
// Global middleware to log request time
//==========================
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestTime = new Date().toISOString();
  console.log(`[${requestTime}] ${req.method} ${req.url}`);
  next(); //function used in middleware to pass control to the next middleware function in the stack
});

// GET: Get all items
app.get("/products", getAllData);

// GET: Get a single item by ID
app.get("/products/:id", getByID);

// POST: Create a new item
app.post("/products", checkInputValidation(productSchema), createData);

// PUT: Update an existing item by ID
app.put("/products/:id", checkInputValidation(productSchema), updateByID);

// DELETE: Delete an item by ID
app.delete("/products/:id", deleteByID);

//=======================
// Global Error Handle
//=======================
app.use(handleError);

export default app;
