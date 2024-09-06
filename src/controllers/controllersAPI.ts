import { Error } from "mongoose";
import { ItemModel } from "../database/models/items.model";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../middlewares/handleErrors";

interface filterQuery {
  [key: string]: any;
}
interface fieldType {
  name: string;
  price: number | { min: number; max: number };
  category: string;
  stock: number | { min: number; max: number };
}
export const getAllData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //STEP 1: Apply Pagination
    const pageLimits: number = req.query.limit
      ? parseInt(`${req.query.limit}`)
      : 10;
    const page: number = req.query.page ? parseInt(`${req.query.page}`) : 1;
    const skip: number = (page - 1) * pageLimits;

    //Apply Filter 2
    const filters = req.query.filters
      ? JSON.parse(req.query.filters as string)
      : {};
    console.log(filters); //{stock:{min:10,max:100}}

    const newFilters: any = {};
    for (let i in filters) {
      if (typeof filters[i] === "object") {
        newFilters[i] = {};
        for (let j in filters[i]) {
          if (j === "min") {
            newFilters[i]["$gte"] = filters[i][j];
          } else {
            newFilters[i]["$lte"] = filters[i][j];
          }
        }
      } else {
        newFilters[i] = filters[i];
      }
    }

    //STEP 3: Apply Sort
    const sortOrder: 1 | -1 =
      (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const sortField = req.query.sortField
      ? (req.query.sortField as string)
      : "name";

    //STEP 4: Execute Query
    const items = await ItemModel.find(newFilters)
      .skip(skip)
      .limit(pageLimits)
      .sort({ [sortField]: sortOrder });
    if (items.length === 0) {
      const error = new Error("Cannot Find!") as AppError;
      error.message = `No Items found!`;
      error.statusCode = 404;
      throw error;
    }
    const totalItems = await ItemModel.countDocuments(newFilters);
    const totalPages = Math.ceil(totalItems / pageLimits);

    res.json({
      items,
      pagination: {
        currentPage: page,
        pageLimit: pageLimits,
        skip: skip,
        totalItem: totalItems,
        totalPage: totalPages,
      },
    });
  } catch (error) {
    // res.status(500).json({ message: "Error fetching items", error });
    next(error);
  }
};

export const getByID = async (req: Request, res: Response) => {
  const itemId = req.params.id;
  const ItemFound = await ItemModel.findById(itemId);
  res.json(ItemFound);
};
export const createData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      const error = new Error("Cannot Find!") as AppError;
      error.message = `${Object.keys(error.name)} already exist`;
      error.statusCode = 400;
    }
    next(error);
  }
};

export const updateByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const itemId = req.params.id;
    const update = await ItemModel.findByIdAndUpdate(itemId, req.body, {
      new: true,
    });
    if (!update) {
      const error = new Error("Cannot Find!") as AppError;
      error.message = `Item ${itemId} not found!`;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).send(update);
  } catch (err) {
    // res.status(500).send(err);
    next(err);
  }
};

export const deleteByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const del = await ItemModel.findByIdAndDelete(id);

    //work when only static index (id)
    if (!del) {
      const error = new Error("Cannot Find!") as AppError;
      error.message = `Item ${id} not found!`;
      error.statusCode = 404;
      throw error;
    }

    res.status(204).send(`Item ${id} has been Updated!`);
  } catch (err) {
    // res.status(500).json({
    //   message: "error server",
    // });
    next(err);
  }
};
