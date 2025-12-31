# OpenInsight

## Project Overview
OpenInsight is a Chrome extension designed to provide instant explanations and fact-checking for highlighted text, adhering to a philosophy of "epistemic minimalism." It aims to strip away clutter and focus on clarity and truth. The extension allows users to customize themes and choose language models via OpenRouter.

**Key Features:**
*   Contextual pop-up for "Explain" and "Fact-check".
*   Customizable themes and LLM selection.
*   Secure local storage for API keys (sandboxed).

**Architecture:**
*   **Frontend:** React with Tailwind CSS.
*   **Build Tool:** Vite.
*   **Core:** TypeScript, Chrome Extension Manifest V3.
*   **API:** Native `fetch` for OpenRouter interactions.

## Project Status
The project is currently in the **initialization phase**. The directory structure has been set up using the **Conductor** methodology, but the core code (Vite project, manifest, etc.) has not yet been generated.

## Key Files & Directories
*   `conductor/product.md`: Defines the product vision, audience, and features.
*   `conductor/tech-stack.md`: Specifies the technology choices.
*   `conductor/workflow.md`: Outlines the development workflow, including TDD and commit conventions.
*   `conductor/tracks/scaffolding_20251231/plan.md`: The immediate plan for building the core scaffolding.
*   `conductor/tracks/`: Contains track-specific plans and specs.

## Development Conventions
*   **Methodology:** Conductor (Plan-driven development).
*   **Workflow:** Test-Driven Development (TDD) is required.
*   **Code Coverage:** Target >80% coverage.
*   **Commit Messages:** Follow the Conventional Commits format (e.g., `feat(ui): ...`, `fix(auth): ...`).
*   **Task Management:** All work is tracked in `plan.md` files within `conductor/tracks/`.

## Next Steps
The immediate next steps are defined in `conductor/tracks/scaffolding_20251231/plan.md`:
1.  Initialize the Vite project.
2.  Configure Tailwind CSS.
3.  Create the Manifest V3 file.
