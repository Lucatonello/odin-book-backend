# Odin-book - Backend

This is the backend for the LinkedIn Clone, a professional networking application inspired by LinkedIn. The backend is responsible for managing the database, handling API requests, and ensuring secure user authentication. Built using Node.js and Express

---

# Tech stack
The backend is built using the following technologies:  

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **JSON Web Tokens (JWT)**

## Features

- **JWT Authentication**: Secure authentication for users and companies.
- **RESTful API**: Provides endpoints for all app functionalities, including user management, posts, job postings, comments, likes, and messaging.
- **Database Management**: Efficiently organizes and stores data for users, companies, posts, job postings, comments, and interactions.
- **Real-Time Notifications**: Enables notifications for post interactions and network updates.

---

## Database Overview

The backend uses a postgreSQL database with the following tables:

- **Users**: Stores information about individual users.
- **Companies**: Holds data about company profiles.
- **Connections**: Manages status of connection requests between users (pending, accepted or declined).  
- **Follows**: Tracks which users or companies are being followed by others.  
- **Posts**: Contains user or company posts, including text, author information, and timestamps.  
- **Comments**: Stores comments associated with posts, including the author and related post.  
- **Likes**: Tracks likes on posts or comments, including the user or company who liked them.  
- **Jobs**: Stores job postings created by companies, including job descriptions and requirements.  
- **Applicants**: Tracks user applications to job posts including Email, phone number and CV.
- **Education**: Manages users’ education history, including schools, degrees, and timelines.  
- **Experience**: Contains users’ professional experience, including job titles, companies, and durations.  
- **Skills**: Tracks individual skills added by users.  
- **Messages**: Stores private messages exchanged between users. 
---

## API Overview

The backend provides RESTful endpoints for the following core functionalities:

The backend provides a robust API to support all core functionalities of the LinkedIn Clone. Here's a high-level overview of the available endpoints:  

- **Authentication**: Enables user and company registration, login, and secure session management with JWTs.  
- **User Management**: Allows fetching, updating, and deleting user profiles, including personal and professional details.  
- **Company Management**: Provides functionality to manage company profiles, including updating information and handling job posts.  
- **Posts and Comments**: Supports creating posts, as well as adding comments on posts.  
- **Likes**: Facilitates liking posts.  
- **Jobs**: Handles job postings, including listing jobs and managing applications.  
- **Messaging**: Enables communication between users.  
- **Notifications**: Provides notifications for user interactions, such as new followers, connection requests, and post interactions.  

## Check out the frontend
- [See the frontend here](https://github.com/Lucatonello/odin-book)
