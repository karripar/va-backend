# VA Backend

Backend repository for the **Vaihtoaktivaattori** project (Media Service Project course).

## Overview

This repository contains the backend logic for Vaihtoaktivaattori, including authentication, user management, and content handling using **Node.js**, **Express**, and **MongoDB**.

## Features

- User authentication (Google Sign-In & custom login)
- Role-based access (students & teachers as admins)
- Profile and content endpoints
- Metropolia Exhange destination webscraping with coordinates attached from a static json file.
- API documentation and testing setup

## Development Notes

- Follow the structure from the **content-server** project for consistency.
- Update **ApiDocs** as new routes are implemented.
- Write tests for endpoints as they are developed to avoid last-minute testing overload.

## Example Reference

See:  
`content-server/src/api/routes/contactRoute.ts` for ApiDoc reference.

## Security

- Thorough validation with **express-validator**
- Rate limiting with **express-rate-limit**
- Scraping data is limited to once every week and databased cached data is used otherwise.
