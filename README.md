## Getting Started

There are two ways to run the project, either locally or using Docker.

### Running with Docker

First, make sure docker is installed on your machine.

Then, run the following command to build and start the project:

```bash
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To stop running, run the following command:

```bash
docker compose down
```

### Running Locally

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [SQLite3](https://www.sqlite.org/index.html)
- [Docker](https://www.docker.com/)

## Functionalities by User Role
The following list indicates what each user is able to do, depending on their role. 

#### Buyers
- user registration
- user login (password is securely hashed)
- view and update profile (excluding email) 
- look up products (by keyword, filters, and categories)
- add products to shopping cart
- checkout and place orders from shopping cart
- view order confirmation with price and Seller info
- review products they have purchased

#### Sellers
- user registration
- user login (password is securely hashed)
- view and update profile (excluding email) 
- create product listings
- remove and edit product listings
- view Buyer reviews

#### HelpDesk
- user registration
- user login (password is securely hashed)
- view and update profile (excluding email) 
- view requests from Buyers and Users
- handle update password requests

## Core Functions Implemented
-[x] User Authentication and Role-Specific Dashboards
-[x] Category Hierarchy
-[x] Product List Management (by Sellers)
-[x] Product Detail and Ordering (by Buyers)
-[x] Reviews (by Buyers)
-[x] Search Product listings
-[x] User Registration and Profile update

## Bonus Features Implemented
-[x] Shoppng Cart (for Buyers)