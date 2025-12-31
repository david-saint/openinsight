# OpenInsight 🔍

OpenInsight is a Chrome extension designed for **instant explanations and fact-checking**, adhering to the philosophy of **"epistemic minimalism."** It strips away the clutter of modern information tools, focusing instead on clarity, truth, and user security.

## 🚀 Key Features

- **Contextual Intelligence:** Highlight any text to instantly trigger an "Explain" or "Fact-check" action.
- **Epistemic Minimalism:** A design philosophy focused on reducing cognitive load and maximizing clarity.
- **Customizable LLMs:** Integration with **OpenRouter**, allowing users to choose their preferred language models.
- **Secure by Design:** Local API key storage encrypted via the **Web Crypto API** and isolated within a sandboxed background environment.
- **Responsive Themes:** Fully customizable interface to match your browsing aesthetic.

## 🛠 Technology Stack

- **Frontend:** [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool:** [Vite](https://vitejs.dev/) with [@crxjs/vite-plugin](https://crxjs.dev/)
- **Core:** TypeScript (Strict Mode)
- **Manifest:** Chrome Extension Manifest V3
- **Testing:** [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **API:** Native `fetch` with [OpenRouter](https://openrouter.ai/)

## 📦 Installation & Development

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Setup

1. Clone the repository:

   ```bash
   git clone git@github.com:david-saint/openinsight.git
   cd openinsight
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

### Loading the Extension

1. Build the project:
   ```bash
   npm run build
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `dist` folder in the project directory.

## 🧪 Testing

OpenInsight maintains high quality through strict Test-Driven Development (TDD) and a >80% coverage target.

- **Run Unit Tests:** `npm run test`
- **Run E2E Tests:** `npm run test:e2e`

## 📐 Architecture & Methodology

OpenInsight follows the **Conductor** methodology—a plan-driven approach to development. Detailed specifications and tracks can be found in the `conductor/` directory.

- `conductor/product.md`: Product vision and target audience.
- `conductor/tech-stack.md`: Detailed technical decisions.
- `conductor/workflow.md`: Development guidelines and standards.

## 🛡 Security

API keys are stored in `chrome.storage.local` and are encrypted using the Web Cryptography API before being saved. All API interactions are handled by the Background Service Worker, ensuring sensitive keys are never exposed to content scripts running on external websites.

## 📄 License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.
