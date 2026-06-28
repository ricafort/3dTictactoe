# Spec-Driven Development

## Overview

Write a structured specification before writing any code. The spec is the shared source of truth between you and the human engineer — it defines what we're building, why, and how we'll know it's done. Code without a spec is guessing.

## When to Use

- When starting a new project, feature, or significant change and no specification exists yet.
- When requirements are unclear, ambiguous, or only exist as a vague idea.
- When the user asks for a feature, but the scope, acceptance criteria, or technical approach are not well-defined.
- For even small changes, if there's any potential for misunderstanding or misalignment, a concise spec (or "mini-spec") following this structure is recommended.

## Process

### Phase 1: Define

1.  **Understand the Goal**: Ask clarifying questions to understand the user's high-level objective.
    -   *What problem are we solving?*
    -   *Who is this for?*
    -   *What does success look like?*
2.  **Draft the Specification**: Create a markdown document (`SPEC.md`) in the project root or a `docs/` directory with the following sections:
    -   **Title**: Clear and concise name for the feature/project.
    -   **Problem Statement**: What specific problem does this solve?
    -   **Goals**: What are the measurable objectives?
    -   **Non-Goals**: What is explicitly *not* being built?
    -   **User Stories/Requirements**: Detailed descriptions of features from the user's perspective, including acceptance criteria.
    -   **Technical Approach (High-Level)**: Initial thoughts on how to build it. Focus on major components, interfaces, and data flows, not specific class implementations or algorithm details.
    -   **Open Questions/Dependencies**: Anything unclear or external factors needed.
3.  **Review with User**: Present the draft spec to the user for feedback and approval.
    -   Incorporate feedback, clarify ambiguities, and iterate until the user explicitly approves the `SPEC.md`.

### Phase 2: Plan

1.  **Generate Technical Implementation Plan**: With the validated spec, generate a detailed technical implementation plan:
    -   Identify the major components and their dependencies.
    -   Determine the implementation order (what must be built first).
    -   Note risks and mitigation strategies.
    -   Identify what can be built in parallel vs. what must be sequential.
    -   Define verification checkpoints between phases.
    -   *Iteration Point*: If generating the plan reveals significant issues or ambiguities in the approved `SPEC.md`, revert to Phase 1: Define to update and re-approve the specification with the user.

### Phase 3: Implement

1.  **Execute Tasks**: Execute tasks one at a time following `incremental-implementation` and `test-driven-development` skills.
2.  **Context Engineering**: Use `context-engineering` skill to load the right spec sections and source files at each step rather than flooding the agent with the entire spec.
3.  *Iteration Point*: If implementation reveals new information or unforeseen complexities that invalidate parts of the approved `SPEC.md`, revert to Phase 1: Define to update and re-approve the specification with the user.

## Verification

- A `SPEC.md` file exists in the project root or a `docs/` directory.
- The `SPEC.md` has been explicitly approved by the user.
- The `SPEC.md` clearly defines:
    - The problem being solved.
    - Measurable goals.
    - Clear non-goals.
    - Detailed user stories/requirements with acceptance criteria.
    - A high-level technical approach.
- Any subsequent code changes directly address requirements laid out in the `SPEC.md`.
- No new features or scope creep are introduced without updating and re-approving the `SPEC.md`.

## Common Rationalizations

| Rationalization                                       | Counter-Argument                                                                                                                                                                                                                                                                                                                                                                                              |
| :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "I'll just start coding, it's a small change."       | Small changes can still have unforeseen complexities or misunderstandings. A quick mini-spec ensures alignment and reduces rework.                                                                                                                                                                                                                                                                          |
| "The requirements are clear enough in the prompt."     | Natural language prompts can be ambiguous. A structured spec forces explicit definition of scope, goals, and acceptance criteria, preventing assumptions and misinterpretations.                                                                                                                                                                                                                            |
| "Writing a spec takes too much time."                 | Time spent clarifying upfront saves significantly more time (and frustration) on rework, debugging misaligned features, or building the wrong thing. It's an investment in efficiency and quality.                                                                                                                                                                                                               |
| "I know what the user wants."                         | Even if you have a strong intuition, a written spec serves as a concrete artifact for the user to confirm. It ensures mutual understanding and provides a reference point if requirements evolve.                                                                                                                                                                                                            |
| "I can adjust the code as I go based on feedback."    | While iterative feedback is good, it's most effective when there's a clear baseline. Without a spec, "adjustments" can lead to endless churn and scope creep without a defined end state.                                                                                                                                                                                                                     |
| "The user just wants the code, not a document."       | The user wants *correct* and *useful* code. A spec is a critical step in ensuring correctness and utility by aligning expectations before implementation begins. It's about delivering value, not just lines of code.                                                                                                                                                                                       |

## Red Flags

- Starting to write implementation code without an approved `SPEC.md` for non-trivial tasks.
- Ambiguous or vague requirements in the `SPEC.md` without follow-up questions.
- User feedback on the spec is not fully incorporated or acknowledged.
- Skipping the "Non-Goals" section, leading to potential scope creep.
- Lack of clear acceptance criteria for user stories.
- Diverging from the approved `SPEC.md` during implementation without explicit re-approval.