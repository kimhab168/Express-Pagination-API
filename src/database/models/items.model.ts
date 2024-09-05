import mongoose, { Schema } from "mongoose";

interface Items {
  name: string;
  price: number;
  category: string;
  stock: number;
}

const ItemSchema: Schema = new Schema<Items>({
  name: { type: String },
  price: { type: Number },
  category: { type: String },
  stock: { type: Number },
});

export const ItemModel = mongoose.model("products", ItemSchema);
