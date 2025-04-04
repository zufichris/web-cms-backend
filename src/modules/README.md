# Modules

This directory contains the individual modules that make up the application's features. Each module is self-contained and follows a consistent structure to ensure maintainability and scalability.

## Structure

Each module is organized into the following subdirectories:

- **`data`**: Contains entities, Data Transfer Objects (DTOs), and Object-Relational Mapping (ORM) related code.
- **`domain`**: Contains the business logic, including repository interfaces and use cases.
- **`http`**: Contains the presentation layer, including controllers and routes.

## Creating a New Module

To create a new module, use the provided script to generate the boilerplate structure. For example:

```bash
npm run generate:module user
```
