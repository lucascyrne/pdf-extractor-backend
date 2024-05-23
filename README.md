## README.md

# PDF Extractor Application

## Overview

This application is designed to extract data from PDF invoices. It consists of a front-end and a back-end, and uses PostgreSQL as its database. Below are the steps to set up and run the application.

## Table of Contents

1. [Front-End Installation and Execution](#front-end-installation-and-execution)
2. [Back-End Installation and Execution](#back-end-installation-and-execution)
3. [Database Setup and Migrations](#database-setup-and-migrations)
4. [Functionality](#functionality)
5. [Running the Invoice Processing Script](#running-the-invoice-processing-script)
6. [Running Tests](#running-tests)

## Front-End Installation and Execution

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Steps

1. **Clone the Repository**

   ```sh
   git clone https://github.com/your-username/pdf-extractor.git
   cd pdf-extractor/frontend
   ```

2. **Install Dependencies**

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Run the Application**

   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. **Access the Application**

   Open your browser and navigate to `http://localhost:3000`.

## Back-End Installation and Execution

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Steps

1. **Clone the Repository (if not done already)**

   ```sh
   git clone https://github.com/lucascyrne/pdf-extractor-backend.git
   cd pdf-extractor/backend
   ```

2. **Install Dependencies**

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Run the Application**

   ```sh
   npm run dev
   # or
   yarn dev
   ```

## Database Setup and Migrations

### Prerequisites

- PostgreSQL (v10 or higher)
- Prisma CLI

### Steps

1. **Install PostgreSQL**

   Follow the instructions for your operating system to install PostgreSQL. Ensure that the `psql` command is available in your terminal.

2. **Create a Database**

   ```sh
   psql -U <username> -c "CREATE DATABASE pdf_extractor_db;"
   ```

3. **Configure Prisma**

   In the `backend` directory, create a `.env` file with the following content, replacing `<username>` and `<password>` with your PostgreSQL credentials:

   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/pdf_extractor_db"
   ```

4. **Install Prisma CLI**

   ```sh
   npm install -g prisma
   # or
   yarn global add prisma
   ```

5. **Run Migrations**

   ```sh
   npx prisma migrate dev --name init
   ```

## Functionality

The application provides the following functionalities:

| Functionality                       | Description                                                  |
| ----------------------------------- | ------------------------------------------------------------ |
| Extract Client Number               | Extracts the client number from the PDF invoice.             |
| Extract Reference Month             | Extracts the reference month from the PDF invoice.           |
| Extract Energy Electricity Quantity | Extracts the quantity of electricity used.                   |
| Extract Energy Electricity Value    | Extracts the value of the electricity used.                  |
| Extract SCEE Quantity               | Extracts the quantity of SCEE without ICMS.                  |
| Extract SCEE Value                  | Extracts the value of SCEE without ICMS.                     |
| Extract Compensated Energy Quantity | Extracts the quantity of compensated energy.                 |
| Extract Compensated Energy Value    | Extracts the value of compensated energy.                    |
| Extract Public Lighting Value       | Extracts the public lighting contribution value.             |
| List Invoices                       | Lists all invoices in the database.                          |
| Download Invoice                    | Allows the user to download an invoice for a specific month. |

## Running the Invoice Processing Script

To process the invoices, run the following command in the `backend` directory:

```sh
npx ts-node src/utils/extractAndStore.ts
```

This script reads PDF files, extracts the relevant data, and stores it in the PostgreSQL database.

## Running Tests

### Prerequisites

- Jest and related testing libraries

### Steps

1. **Install Testing Dependencies**

   ```sh
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest jest-environment-jsdom
   ```

2. **Configure Jest**

   Ensure your `package.json` has the correct Jest configuration:

   ```json
   "jest": {
     "preset": "ts-jest",
     "testEnvironment": "jest-environment-jsdom",
     "setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"]
   }
   ```

3. **Run Tests**

   ```sh
   npm test
   ```

By following these steps, you should be able to set up and run the PDF extractor application successfully. If you encounter any issues, please check the logs and ensure that all prerequisites are met.
