export interface ICategory {
  categoryId: number;
  name: string;
  slug: string;
  image: string;
  parentId?: number | null;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
