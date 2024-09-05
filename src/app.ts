import express, { Request, Response, NextFunction } from "express";
import { ItemModel } from "./database/models/items.model";
import { checkInputValidation } from "./middlewares/inputValidation";
import { productSchema } from "./middlewares/inputValidation";
import { Error } from "mongoose";
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
app.get("/products", async (req: Request, res: Response) => {
  const pageLimits: number = req.query.limit
    ? parseInt(`${req.query.limit}`)
    : 10;
  const page: number = req.query.page ? parseInt(req.query.page as string) : 1;
  const skip: number = (page - 1) * pageLimits;
  try {
    const items = await ItemModel.find().skip(skip).limit(pageLimits);
    if (items.length === 0)
      return res.status(404).json({ message: "Item not found" });

    const totalItems = await ItemModel.countDocuments();
    const totalPages = Math.ceil(totalItems / pageLimits);

    res.json({
      items,
      pagination: {
        totalPage: totalPages,
        totalItem: totalItems,
        currentPage: page,
        pageLimit: pageLimits,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

// GET: Get a single item by ID
app.get("/products/:id", async (req: Request, res: Response) => {
  const itemId = req.params.id;
  const ItemFound = await ItemModel.findById(itemId);
  res.json(ItemFound);
});

// POST: Create a new item
app.post(
  "/products",
  checkInputValidation(productSchema),
  async (req: Request, res: Response) => {
    try {
      // STEP 1: Get Data from Request Body
      const newItem = req.body;

      // STEP 2: Create new data to DB
      const addItem = await new ItemModel(newItem).save();

      // STEP 3: Send to Client
      res.status(201).json(addItem);
    } catch (error) {
      // @ts-ignore
      if (error.code === 11000) {
        return res.status(400).json({
          // @ts-ignore
          message: `${error.KeyValue.name} already exist`,
        });
      }
      res.status(500).json({ message: `Something went wrong` });
    }
  }
);
// app.post(
//   "/products",
//   checkAllValidate(productSchema),
//   async (req: Request, res: Response) => {
//     try {
//       const newItem = new ItemModel(req.body);
//       await newItem.save();
//       res.status(201).json(newItem);
//     } catch (error) {}
//   }
// );

// PUT: Update an existing item by ID
app.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id;
    const update = await ItemModel.findByIdAndUpdate(itemId, req.body, {
      new: true,
    });
    if (!update) {
      return res.status(404).json({
        message: `Item ${itemId} not found!`,
      });
    }

    res.status(200).send(update);
  } catch (err) {
    res.status(500).send(err);
  }
});

// DELETE: Delete an item by ID
app.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const del = await ItemModel.findByIdAndDelete(id);

    if (!del) {
      return res.status(404).send();
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({
      message: "error server",
    });
  }
});

export default app;
