FROM node:24-alpine3.21
WORKDIR /code

# Use apk for Alpine
RUN apk update && apk add --no-cache \
    curl \
    vim \
    git

COPY package.json package.json
RUN yarn install
RUN yarn prisma generate  
RUN yarn build
COPY . .

EXPOSE 3000
CMD ["yarn", "start"]