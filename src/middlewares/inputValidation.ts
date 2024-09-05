import { object, string, number } from "yup";
import { Request, Response, NextFunction } from "express";
import { Schema } from "yup";
export let productSchema = object({
  name: string().required("name required"),
  price: number().required("price required").positive("price must be positive"),
  category: string().required("category required"),
  stock: number()
    .required("stock required")
    .integer("stock must be integer")
    .positive("stock must be positive"),
});

export const checkInputValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await productSchema.validate(req.body, { abortEarly: false });

    next();
  } catch (error) {
    res.status(400).json({
      message: "Validation error",
      errors: error, // List of validation errors
    });
  }
};
export function checkInputValidation(Schema: Schema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Schema.validate(req.body, { abortEarly: false })
      next();
    } catch (error) {
      return res.status(400).json({ message: "Invalidate", error: error })
    }
  }
}