import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../interfaces/product.interface';
import { IColorVariant } from '../interfaces/colorVariant.interface';
import { ISizeVariant } from '../interfaces/sizeVariant.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { generateSku } from '../utils/generateSku.util';
import slugify from 'slugify';

export interface IProductDoc extends IProduct, Document {}

const SizeVariantSchema = new Schema<ISizeVariant>(
  {
    size: { type: String, required: true },
    sku: { type: String, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ColorVariantSchema = new Schema<IColorVariant>(
  {
    color: { type: String, required: true },
    sku: { type: String, unique: true },
    images: { type: [String], default: [] },
    price: { type: Number },
    stock: { type: Number },
    sizes: { type: [SizeVariantSchema], default: [] },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDoc>(
  {
    productId: { type: Number, unique: true },
    name: { type: String, required: true },
    title: { type: String },
    brand: { type: String, required: true },
    categoryId: { type: Number, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    imageProduct: { type: String },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    attributes: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    variants: { type: [ColorVariantSchema], default: [] },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

ProductSchema.pre<IProductDoc>('validate', async function (next) {
  if (!this.productId) {
    this.productId = await getNextSequence(DB_COLLECTIONS.PRODUCTS);
  }
  next();
});

ProductSchema.pre<IProductDoc>('save', async function (next) {
  // Generate SKU for each color variant if not already set
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((colorVariant) => {
      if (!colorVariant.sku) {
        colorVariant.sku = generateSku(
          this.productId,
          colorVariant.color,
          'BASE'
        );
      }
    });
  }
  // Generate SKUs for each size variant if not already set
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((colorVariant) => {
      if (colorVariant.sizes && colorVariant.sizes.length > 0) {
        colorVariant.sizes.forEach((sizeVariant) => {
          if (!sizeVariant.sku) {
            sizeVariant.sku = generateSku(
              this.productId,
              colorVariant.color,
              sizeVariant.size
            );
          }
        });
      }
    });

    // Generate slug if not already set
    if (this.isModified('title') || this.isNew) {
      const baseSlug = slugify(this.title || this.name, {
        lower: true,
        strict: true,
      });
      let slug = baseSlug;
      let count = 0;

      const ProductModel = this.constructor as mongoose.Model<IProductDoc>;

      while (await ProductModel.exists({ slug })) {
        count++;
        slug = `${baseSlug}-${count}`;
      }

      this.slug = slug;
    }
  }
  next();
});

export const Product = mongoose.model<IProductDoc>(
  DB_COLLECTIONS.PRODUCTS,
  ProductSchema
);
