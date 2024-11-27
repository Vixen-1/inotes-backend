# Express.js API with Authentication and Validation

This project is an Express.js API that includes user authentication, validation, and password hashing. It uses the following technologies:

- **express.js**: For creating the server and handling routes.
- **express-validator**: For validating input data.
- **bcrypt.js**: For hashing passwords.
- **jsonwebtoken**: For authentication using JWT tokens.

## Features

- User registration with input validation
- User login with JWT authentication
- Password hashing using bcrypt.js
- Secure storage of JWT tokens

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Vixen-1/inotes-backend
    cd inotes-backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables. Create a `.env` file in the root directory and add the following:
    ```env
    JWT_SECRET_KEY=your_jwt_secret
    MONGO_URL=your connection string of mongodb database
    ```

4. Start the server:
    ```bash
    npm start
    ```

## API Endpoints


### Register a New User


### User Login


### Get Logged-in User Details


### Add a new note after login


### Update the note by passing its unique id 


### fetch all notes


### delete notes



## Usage

### Register a User

Send a POST request to `/api/auth/createuser` with the user's name, email, and password.

### Login a User

Send a POST request to `/api/auth/login` with the user's email and password. The response will contain a JWT token.

### Get User Details

Send a POST request to `/api/auth/getuser` with the JWT token in the Authorization header.

### Add a note for particular user

Send a POST request to `/api/notes/addnote` with jwt-token, content/type, title, description and tag after login.

### Update the note

Send a PUT request to `/api/notes/updatenote/:id` with token, content-type, user_id and updated title/description or tag.

### Fetch all the note

Send a GET request to `/api/notes/fetchallnotes` with token, content-type, user_id and updated title/description or tag.

### Delete the note

Send a DELETE request to `/api/notes/deletenote/:id` with the JWT token and id.


## Middleware


### fetchuser

A middleware to fetch and validate the user using the JWT token. It is used in the `/api/auth/getuser`, `api/notes/fetchallnotes`, `/api/notes/addnote`, `/api/notes/updatenote/:id` and `/api/notes/deletenote/:id` endpoints to ensure the user is authenticated.


## Dependencies

- express
- express-validator
- bcryptjs
- jsonwebtoken



## Contact

- Author: Ayushi Saxena
- Email: [ayushisaxena24111999@gmail.com]
- GitHub: [Vixen-1](https://github.com/Vixen-1)

