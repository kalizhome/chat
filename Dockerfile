FROM alpine:latest

RUN apk add nodejs
RUN apk add npm
# Create app directory
WORKDIR /usr/src/app
COPY . .
RUN npm install --production
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
CMD [ "npm", "start" ]