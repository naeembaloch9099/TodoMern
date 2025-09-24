# MongoDB Atlas Authentication Fix

## Current Issue

Authentication failed with MongoDB Atlas. This means the username/password combination in the connection string is incorrect.

## To Fix This:

### Step 1: Get the Correct Username

1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Sign in to your account
3. Go to your cluster (cluster0.ge8kpoz.mongodb.net)
4. Click "Database Access" in the left sidebar
5. Find the username you created for database access
6. Note down the exact username (case-sensitive)

### Step 2: Verify the Password

The password you provided is: `Mnbv6584`
Make sure this is the correct password for your database user.

### Step 3: Update the .env file

In the `.env` file, update the MONGODB_URI with the correct username:

```
MONGODB_URI=mongodb+srv://YOUR_ACTUAL_USERNAME:Mnbv6584@cluster0.ge8kpoz.mongodb.net/todoapp?retryWrites=true&w=majority
```

Replace `YOUR_ACTUAL_USERNAME` with the username from Step 1.

### Step 4: Common Username Patterns

Try these common patterns if unsure:

- Your MongoDB Atlas email username (before @)
- "admin" or "root"
- "naeem" or "naeembaloch"
- "todouser" or "todoapp"
- Your GitHub username: "Complete-Coding"

### Step 5: Check IP Whitelist

1. In MongoDB Atlas, go to "Network Access"
2. Make sure your current IP is whitelisted
3. Or add `0.0.0.0/0` for development (allow all IPs)

### Step 6: Test Connection

After updating the username, the nodemon should automatically restart and show:

```
✅ MongoDB Connected: cluster0-shard-00-00.ge8kpoz.mongodb.net
📊 Database: todoapp
```

## Alternative: Create New Database User

If you can't remember the username:

1. Go to "Database Access" in MongoDB Atlas
2. Click "Add New Database User"
3. Create a new user with username: `todouser` and password: `Mnbv6584`
4. Give it "Read and write to any database" permissions
5. Update the .env file with the new credentials
