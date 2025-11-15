# VA Backend

Backend repository for the **Vaihtoaktivaattori** project (Media Service Project course).

## Overview

- This repository contains the backend logic for Vaihtoaktivaattori, including authentication, user management, and content handling using **Node.js**, **Express**, and **MongoDB**. 
- The repository is divided to three main servers: `auth-server`, `content-server` and `upload-server`.
- Additionally - `proxy-server` and `sync-service` are available for Open AI vector store and AI feature services. (Paid or credit card required)


## Features

**Auth Server**
- User authentication (Google Sign-In & custom login)
- Role-based access and authentication (Exchange coordinators as admins)
- Profile specific content
- API documentation, TypeDoc documentation and testing setup with Vitest + Supertest.

**Content Server**
- Metropolia Exhange destination webscraping with coordinates attached from a static json file.
- Application instructions endpoints and destination scraping URL storage.
- Metropolia Exchange partner university data scraping logic and caching.
- Contact information storage and modification.
- Exchange stories and experiences.
- Admin actions related to the previous features.

**Upload Server**
- Image and File upload logic with multer
- File modification and deletion.
- Files are served with express static through the `uploads` folder at `http://localhost:3003/uploads`


## Documentation

- In addition to the `.md` documentation, available API routes are documented with [ApiDoc](https://apidocjs.com/), and controllers related to CRUD operations are documented with [TypeDoc](https://typedoc.org/).
- Documentation is rendered statically on each server at `/docs/api` and `/docs/typedoc`.
- Run `npm run apidoc` to generate documentation for the routes, and `npm run typedoc` to generate documentation for the controllers.
- `npm run build` will build the entire server along with all documentation.


**TypeDoc Documentation**
- TODO: Add links to the documentation here and below when the app is launched.

**ApiDoc Dodumentation**

## Project Installation

**MongoDB Installation / Atlas Configuration**<br>

You can do one of the following:

1. Install the MongoDB Community Server from [here](https://www.mongodb.com/try/download/community) and follow the on-screen instructions. Paste the connection string to your database into the environment variables.

2. Use an Atlas database hosted online [here](https://www.mongodb.com/products/platform/atlas-database) Create a cluster, generate a connection string, and paste it into the environment variables. The free basic tier provides limited but sufficient capacity.

Local Community Server installation is recommended for security and it provides the MongoDB Compass graphical database management application.

**Server Installation**<br>
1. Clone The repository in your desired directory.
2. Make sure Node.js and NPM are installed with a stable release version.
3. Repeat the following instructions for all subfolders or repositories (Auth, Content, Upload, Proxy...), not for the repository root.
4. Open the separate repository(s) in split terminals.
5. Install the required node_modules with the command `npm install`
6. Fill in the required environment variables with the instructions in the following paragraph.
7. Enter `npm run dev` once MongoDB is installed or an Atlas account is created for all terminals.
8. `npm run build` is configured to automatically build documentation as well.
9. All available commands are found in the `package.json` file.

## Environment Variables

**Example Variables**<br>
- Required environment variables are found in the `.env.sample` file. Copy the content and create a new `.env` file with it. `.env` is already included in .gitignore.
- IMPORTANT: All servers have their own unique `.env.sample`.

**Google API Client**<br>
- To get access to the Google OAuth 2.0 flow and authentication, you need to create a Client ID. Follow the instructions found [here](https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid) and place the acquired Client ID in the environment variables. Same Cliend ID is required in the front-end as well.

## Development Notes (TODO: Remove this when all gooooood)

- Follow the structure from the **content-server** project for consistency.
- Update **ApiDocs** as new routes are implemented.
- Write tests for endpoints as they are developed to avoid last-minute testing overload.


## Security

- Thorough validation with **express-validator**
- Rate limiting with **express-rate-limit**
- Scraping data is limited to once every week and databased cached data is used otherwise.
