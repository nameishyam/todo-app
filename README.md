# To-Do Application  

A simple and efficient to-do application designed for students and developers to manage their daily tasks. Users can create and update their tasks, with each to-do linked to a specific user for personalized task management.  



## Features  
- User-specific to-do creation and updates.  
- Intuitive and responsive UI built with EJS.  
- Backend powered by Express.js and Node.js.  
- Secure and scalable database with PostgreSQL.  
- Deployed for easy access via Render, with the database hosted on Railway.  



## Technologies Used  
- **Frontend:** EJS (Embedded JavaScript)  
- **Backend:** Express.js, Node.js  
- **Database:** PostgreSQL (deployed on Railway)  
- **Deployment:** Render  



## Setup Instructions  

1. **Clone the repository**:  
   ```bash  
   git clone https://github.com/nameishyam/todo-app.git  
   cd todo-app  
   ```  

2. **Install dependencies**:  
   ```bash  
   npm install  
   ```  

3. **Set up environment variables**:  
   Create a `.env` file with the following:  
   ```env  
   DATABASE_URL=<your_postgresql_connection_url>  
   ```  

4. **Run the application locally**:  
   ```bash  
   npm start  
   ```  
   Access the app at `http://localhost:3000`.  



## Live Demo  
Check out the live demo [here](https://todo-app-cxrh.onrender.com/).  



## Future Enhancements  
- **User Authentication**: Add login and signup features for enhanced security.  
- **Task Categories**: Organize tasks into categories or tags.  
- **Reminders and Notifications**: Enable reminders for upcoming tasks.  
- **Mobile Responsiveness**: Improve UI for a seamless mobile experience.  
- **Dark Mode**: Add a toggle for light/dark themes.  



## Deployment  
The application is deployed using:  
- **Render**: For hosting the Node.js backend and frontend.  
- **Railway**: For PostgreSQL database hosting.  



## Target Audience  
Designed for **students** and **developers** to easily organize and track their tasks.  



## Contributions  
Contributions are welcome! Feel free to submit issues or pull requests to improve the app.  



## License  
This project is licensed under the MIT License.  
