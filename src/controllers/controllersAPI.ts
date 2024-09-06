import { Error } from "mongoose";
import { ItemModel } from "../database/models/items.model";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../middlewares/handleErrors";

interface filterQuery {
  [key: string]: any;
}

export const getAllData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //STEP 1: Apply Paagination
    const pageLimits: number = req.query.limit
      ? parseInt(`${req.query.limit}`)
      : 10;
    const page: number = req.query.page ? parseInt(`${req.query.page}`) : 1;
    const skip: number = (page - 1) * pageLimits;

    //STEP 2: Apply Filter
    const filterQ: filterQuery = {};
    const { name, category, price, stock } = req.query;
    if (name) {
      filterQ.name = name as string;
    }
    if (category) {
      filterQ.category = category as string;
    }
    if (price) {
      const parsedPrice = parseInt(price as string);
      if (!isNaN(parsedPrice)) {
        filterQ.price = parsedPrice;
      }
    }
    if (stock) {
      const parsedStock = parseInt(stock as string);
      if (!isNaN(parsedStock)) {
        filterQ.stock = parsedStock;
      }
    }

    //STEP 3: Apply Sort
    const sortOrder: 1 | -1 =
      (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const sortField = req.query.sortField
      ? (req.query.sortField as string)
      : "name";

    //STEP 4: Execute Query
    const items = await ItemModel.find(filterQ)
      .skip(skip)
      .limit(pageLimits)
      .sort({ [sortField]: sortOrder });
    if (items.length === 0) {
      const error = new Error("Cannot Find!") as AppError;
      error.message = `No Items found!`;
      error.statusCode = 404;
      throw error;
    }
    const totalItems = await ItemModel.countDocuments(filterQ);
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
