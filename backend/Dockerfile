# Use the official Node.js image.
FROM node:16

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "node", "firebase.js" ]

# Inform Docker that the container listens on the specified port.
EXPOSE 3000
