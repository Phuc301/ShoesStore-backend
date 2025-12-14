# Product Service - TODOs

## 📌 Features to Implement

### 1. Related Products

- **Endpoint**: `GET /products/:id/related`
- **Description**: Return a list of related products based on:
  - Same `categoryId`
  - Or same `brand`
- **Status**: ⏳ Pending

---

### 2. Top Rated & Best Sellers

- **Endpoints**:
  - `GET /products/top-rated`
  - `GET /products/best-sellers`
- **Description**:
  - `top-rated`: Fetch products with the highest average rating.
  - `best-sellers`: Fetch products with the highest sales volume.
- **Status**: ⏳ Pending

---

### 3. Global Product Search

- **Options**:
  - Integrate into `GET /products` with query filters.
  - Or build a separate **search-service** (microservice).
- **Status**: 📝 Discussion Needed

---

## 🗂️ Notes

- Need to define the criteria for **best-sellers**  
  (e.g., top sales in the last 30 days vs. all-time total).
- Should implement caching for `top-rated` and `best-sellers` to improve performance.
- For `re
