
# App Quiz

An Angular application demonstrating a quiz platform with a modern UI, reusable components, and REST API integration.

## Features

* Angular 22
* Standalone Components
* REST API integration
* Environment-based configuration
* Responsive user interface
* Unit tests with Vitest

## Requirements

* Node.js 20+
* npm
* Angular CLI

## Installation

Clone the repository:

```bash
git clone https://github.com/romkaras2-a11y/app-quiz.git
cd app-quiz
```

Install dependencies:

```bash
npm install
```

## Development

The project uses Angular environments.

### Development Environment

`src/environments/environment.dev.ts`

Example:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### Production Environment

`src/environments/environment.prod.ts`

Example:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api.example.com/api'
};
```

The application should access the backend using:

```typescript
environment.apiUrl
```

instead of hardcoded URLs.

## Running the application

Start the development server:

```bash
ng serve
```

Open:

```
http://localhost:4200
```

## Optional: Proxy Configuration

If you use a local backend, you can configure a proxy (`proxy.conf.json`) and use relative API paths during development.

Example:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Run Angular with:

```bash
ng serve --proxy-config proxy.conf.json
```

## Build

Development build:

```bash
ng build
```

Production build:

```bash
ng build --configuration production
```

## Testing

Run unit tests:

```bash
ng test
```

## Project Structure

```text
src/
 ├── app/
 ├── environments/
 │    ├── environment.dev.ts
 │    └── environment.prod.ts
 ├── assets/
 └── styles/
```

---
## 📝 Lizenz

MIT License - Freie Nutzung für private und kommerzielle Zwecke.

## Author

Roman Karas
