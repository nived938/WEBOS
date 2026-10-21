# INSTALLATION.md - Installation and Deployment Guide for NOVA OS

This guide covers setting up NOVA OS locally, preparing production builds, and deploying to modern hosting targets.

---

## 1. System Requirements

- **Node.js**: `v18.0.0` or later (`node -v`)
- **Package Manager**: `npm` `v9.0.0` or later (`npm -v`)
- **Hardware Acceleration**: WebGL 2.0 capable graphics driver recommended for 3D Three.js games.

---

## 2. Local Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/nived938/WEBOS.git

# 2. Enter project directory
cd WEBOS

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

The terminal will output the local dev server address:
```
  VITE v8.3.4  ready in 280 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 3. Production Build & Preview

To compile the application into static HTML/CSS/JS assets:
```bash
# Run TypeScript compilation and Vite bundler
npm run build
```
The compiled output is located in `dist/`.

To test the compiled production build locally:
```bash
npm run preview
```
This serves `dist/` on `http://localhost:4173` simulating production HTTP caching.

---

## 4. Deployment Targets

### A. Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`

### B. Deploy to Netlify
1. Connect repository in the Netlify Dashboard.
2. Build command: `npm run build`
3. Publish directory: `dist`

### C. Deploy to GitHub Pages
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### D. Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
Build and run:
```bash
docker build -t nova-os .
docker run -p 8080:80 nova-os
```
Access at `http://localhost:8080`.
