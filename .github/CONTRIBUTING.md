# Contributing to ez-portable-text

First off, thank you for considering contributing to ez-portable-text! It's people like you that make the rich-text editor experience on the web a better place.

## 🛠️ Development Standards

We maintain a high bar for engineering excellence. All contributions must adhere to the following:

1.  **JavaScript & Clean Code**: The project is written in Vanilla JS utilizing Preact and HTM. Write clean, readable code with descriptive variable names.
2.  **JSDoc Mandate**: 100% JSDoc coverage for all exported components and modules. Include `@param` and `@returns`.
3.  **Lightweight & Minimal Dependencies**: Avoid heavy external dependencies. We build optimized bundles utilizing Rollup.
4.  **Formatting**: Always run `npx prettier --write .` before submitting.

## 🚀 Getting Started

1.  **Fork the repository** and create your branch from `main`.
2.  **Install dependencies**: `bun install` (or `npm install`).
3.  **Local Dev / Sandbox**: Use `bun run dev` (or `npm run dev`) to compile the project in watch mode, and open `sandbox/index.html` in your browser.
4.  **Build production bundles**: `bun run build` (or `npm run build`) to test Rollup bundling.

## 🧪 Testing Policy

- Every bug fix should be accompanied by a manual check in the sandbox page.
- Ensure that visual editing and JSON output editing are fully synchronized.

## 📦 Pull Request Process

1.  Ensure your code passes Prettier formatting and Rollup builds successfully.
2.  Update the documentation (`README.md`) if you're changing functionality.
3.  Use [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages.
4.  Your PR will be reviewed and merged once it meets all standards.

## ⚖️ Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

_Thank you for building the future of PortableText editors with us!_
