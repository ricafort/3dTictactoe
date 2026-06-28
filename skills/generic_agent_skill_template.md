# Generic Agent Skill Template

---
name: Generic Skill Template
description: A template for creating new agent skills.
version: "1.0.0"
tags:
  - template
  - skill-development
  - guidelines
references:
  - "https://example.com/skill-guidelines.md"
scripts:
  - "scripts/setup.sh"
assets:
  - "assets/example.json"
---

This document outlines the structure and best practices for creating effective agent skills.

## Skill Definition

-   **Purpose**: Clearly state the primary goal and intended use case of this skill.
-   **Triggers**: Describe the natural language phrases or conditions that should activate this skill.
    -   Example: "Use this skill when the user asks to 'create a new project', 'initialize a repository', or 'set up a boilerplate'."

## Execution Guidelines

-   **Step-by-Step Process**: Provide a clear, ordered list of steps the agent should follow to accomplish the task.
    -   Step 1: **Deconstruct Request & Plan**: Break down the user's request into actionable sub-tasks. If the request is ambiguous or incomplete, ask clarifying questions to gather necessary details and confirm the plan.
    -   Step 2: **Identify & Confirm Inputs**: Determine all necessary inputs (e.g., project name, technology stack) from the user or current context. Confirm understanding with the user if there are multiple valid interpretations.
    -   Step 3: Validate inputs against known constraints or patterns.
    -   Step 4: Execute necessary commands or API calls.
        -   Example: `npm init <project-type> --template <template-name>`
    -   Step 5: Provide feedback or summary of actions taken to the user.
-   **Tool Usage**: Specify which tools or commands are expected to be used.
    -   Example: "Prefer `git` for version control operations. Use `npm` or `yarn` for package management."
-   **Error Handling**: Guide the agent on how to react to common errors or unexpected outcomes.
    -   If a command fails, report the error message to the user and suggest troubleshooting steps.
    -   If user input is invalid, ask for clarification or provide valid options.

## Constraints and Best Practices

-   **Limitations**: Clearly state what this skill *cannot* do or areas where it requires human intervention.
    -   Example: "This skill does not handle complex authentication flows; assume basic API key authentication."
-   **Security**: Emphasize security considerations, such as input sanitization or avoiding sensitive data exposure.
    -   Rule: Always sanitize user-provided script arguments before execution.
-   **Performance**: Advise on efficient execution, especially for resource-intensive tasks.
    -   Rule: Prefer incremental updates over full re-generations when possible.
-   **Context Awareness**: Instruct the agent on how to leverage or maintain user context.
    -   Rule: Actively leverage previous conversation turns and current environment for context unless the user explicitly resets it.
-   **User Interaction**: Define preferred interaction patterns.
    -   Rule: Confirm destructive actions with the user before proceeding.
    -   Rule: Ask clarifying questions if the request is ambiguous.

## Output Format

-   **Expected Output**: Describe the format and content of the expected output.
    -   For code generation: Output well-commented, idiomatic code.
    -   For reports: Provide a concise summary followed by detailed findings.
-   **Artifacts**: List any files or data that should be created or modified.

## Example Scenario

When a user asks: "Create a new React component called `Button` in TypeScript."

The agent should:
1.  Confirm the project structure (e.g., `src/components/`).
2.  Generate `src/components/Button/Button.tsx`, `src/components/Button/Button.module.css`, and `src/components/Button/index.ts`.
3.  Include basic `Button` component structure with props for `onClick` and `children`.
4.  Report successful creation and suggest next steps (e.g., adding to `App.tsx`).