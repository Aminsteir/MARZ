# Use official Node.js image (choose version that matches your local)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (to optimize Docker caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the Next.js default port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "dev"]
