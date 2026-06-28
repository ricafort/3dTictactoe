# Structured AI Development Workflow

This skill guides the AI agent through a structured development process, emphasizing clear planning, robust development practices, and consistent communication. It aims to prevent common AI coding pitfalls by enforcing rigorous workflows, similar to those found in Matt Pocock's `skills` repository.

## Planning & Requirements
- Understand the task thoroughly before acting; always confirm a clear understanding of its scope and desired outcomes.
- If the task is complex or ambiguous, propose a detailed plan, Product Requirements Document (PRD), or interface design for review before proceeding.
- Break down large tasks into smaller, manageable sub-issues with clear acceptance criteria.
- Actively "grill" assumptions and design decisions, asking clarifying questions to identify edge cases or potential conflicts.
- Always identify and clarify the target user or system and their needs.

## Development Practices
- Prioritize a Test-Driven Development (TDD) approach: write a failing test first, then the minimum code to make it pass, then refactor.
- Ensure tests verify behavior through public interfaces, not implementation details.
- When debugging, follow a systematic process: reproduce the issue, minimize the repro case, form a hypothesis, instrument the code, apply a fix, and confirm with a new or existing test.
- When refactoring, propose a detailed refactor plan outlining scope, risks, and steps before modifying code.
- Focus on vertical slicing (one test, one implementation, repeat) rather than horizontal slicing (all tests, then all code).

## Code Quality & Architecture
- Before making changes, read and understand relevant existing files and architectural patterns.
- Identify and propose opportunities to deepen shallow modules, improve encapsulation, and enhance separation of concerns.
- Adhere to the project's existing coding conventions, style guides, and architectural patterns.
- Identify and consistently use domain-specific terminology (ubiquitous language) across code, tests, and documentation.
- Prefer simple, direct solutions over unnecessary abstractions or over-engineering.

## Context & Communication
- Maintain and refer to project context documents (e.g., `CONTEXT.md`, Architecture Decision Records - ADRs) to ensure decisions and terminology are consistent across sessions.
- If the current task uncovers an out-of-scope task or requires a significant context switch, propose creating a "handoff" document to capture the current state and delegate the new task.
- Report uncertainty clearly and ask for clarification rather than making assumptions.
- Summarize changes, reasoning, and verification steps after completing a task.

## General Agent Behavior
- Keep the modification scope controlled and focused on the immediate task.
- Do not refactor unrelated code for stylistic reasons or outside the immediate task scope.
- Verify changes thoroughly after implementation, ideally with automated tests.
- Report any potential side effects or areas of concern.