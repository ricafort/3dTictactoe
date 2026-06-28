# Stripe Best Practices

## General Integration Guidelines
- **Prioritize official Stripe libraries:** Always use Stripe's official client libraries for your chosen language to handle API requests, authentication, and error handling consistently.
- **Secure API keys:** Never expose secret API keys in client-side code, public repositories, or logs. Use environment variables or a secure secret management service.
- **Handle webhooks securely:** Verify webhook signatures to ensure events are from Stripe and haven't been tampered with.
- **Idempotency for API requests:** Use idempotency keys for all write operations to prevent duplicate transactions if a request is retried.
- **Error handling and logging:** Implement robust error handling for all Stripe API calls and log relevant details for debugging.

## Payments
- **Client-side tokenization:** Use Stripe Elements or the Stripe.js library to securely collect sensitive payment information directly from the client, preventing it from touching your server.
- **Strong Customer Authentication (SCA):** Implement SCA flows using Payment Intents for European customers and other regions requiring additional authentication.
- **Asynchronous payment flows:** Design your payment processing to handle asynchronous events (e.g., 3D Secure authentication, delayed notifications) using webhooks.
- **Refunds:** Process refunds programmatically via the Stripe API and ensure your internal systems reflect the refund status.

## Subscriptions and Billing
- **Subscription management:** Use Stripe Billing for recurring payments, managing plans, invoices, and customer subscriptions.
- **Webhook events for subscription changes:** Listen for subscription-related webhooks (e.g., `customer.subscription.updated`, `invoice.payment_succeeded`, `invoice.payment_failed`) to keep your application's state synchronized with Stripe.
- **Trial periods:** Clearly communicate trial periods and ensure proper handling of trial expirations and conversions.
- **Proration:** Understand and configure proration settings for subscription changes (upgrades, downgrades) to ensure accurate billing.

## Customer Management
- **Customer objects:** Create and manage `Customer` objects in Stripe for each of your users to associate payment methods, subscriptions, and payment history.
- **Metadata:** Utilize metadata on Stripe objects (Customers, Charges, Subscriptions) to store custom, non-sensitive information relevant to your application.

---

# Upgrade Stripe SDK and API Versions

## General Upgrade Process
- **Review changelog:** Before upgrading, thoroughly review the official Stripe API and SDK changelogs for breaking changes, new features, and deprecations.
- **Backup your code:** Always create a backup of your application code and database before initiating an upgrade.
- **Test in a staging environment:** Perform all upgrades and testing in a dedicated staging or development environment before deploying to production.
- **Update SDK first:** Upgrade your Stripe client library (SDK) to the latest compatible version. Follow the SDK-specific upgrade guides.
- **Update API version:** After updating the SDK, consider updating the API version used in your Stripe account settings and in your API requests.
- **Automated tests:** Ensure your comprehensive test suite covers all Stripe integrations, especially payment flows, webhooks, and subscription management.

## Handling Breaking Changes
- **Deprecations:** Address any deprecated API features or parameters mentioned in the changelog. Replace them with the recommended alternatives.
- **Parameter changes:** Adjust your API request payloads to conform to any changes in required or optional parameters.
- **Response structure changes:** Update your code to handle modifications in the structure of API responses (e.g., renamed fields, nested objects).
- **Webhook event changes:** Verify if any webhook event structures or types have changed and update your webhook handlers accordingly.
- **New required fields:** If new required fields are introduced for certain API calls, ensure your application provides them.

## Testing and Validation
- **End-to-end testing:** Conduct end-to-end tests for all critical Stripe workflows:
    - Customer creation and updates
    - Payment collection (one-time, recurring)
    - Refunds
    - Subscription creation, modification, and cancellation
    - Webhook processing
- **Edge cases:** Test various edge cases, including failed payments, declined cards, and network errors.
- **Performance testing:** Monitor the performance of your Stripe integrations after the upgrade to ensure no regressions.
- **Monitoring:** After deployment, closely monitor your logs and Stripe dashboard for any unexpected errors or issues.

## Rollback Plan
- **Pre-defined rollback steps:** Have a clear rollback plan in case issues arise in production after the upgrade.
- **Version control:** Use version control to easily revert to the previous working state of your code.

---

# Firecrawl Build Integration

## Web Search and Scraping
- **Initialize Firecrawl client:** Set up the Firecrawl client with your API key for authentication.
- **Crawl URLs:** Use the `crawl` method to fetch content from a specific URL. Specify options for depth, content type (HTML, Markdown), and metadata.
- **Process scraped data:** Parse the returned content (e.g., Markdown, JSON) to extract relevant information for your application.
- **Handle rate limits:** Implement retry mechanisms with exponential backoff to manage Firecrawl API rate limits.
- **Error handling:** Gracefully handle network errors, invalid URLs, and Firecrawl-specific errors during crawling.

## Data Extraction
- **Define extraction schemas:** Use Firecrawl's extraction capabilities by defining a schema (e.g., JSON schema) to extract structured data from web pages.
- **Target specific elements:** Provide CSS selectors or XPath expressions within your schema to precisely target the data you need.
- **Iterate over lists:** Configure extraction rules to correctly identify and extract data from lists or repeating elements on a page.
- **Clean and transform data:** Post-process the extracted data to clean it, convert types, or transform it into your desired format.

## Browser Interaction
- **Simulate user actions:** Use Firecrawl's browser interaction features to simulate clicks, form fills, and navigation.
- **Specify actions sequentially:** Define a sequence of actions (e.g., `click`, `type`, `goto`) to perform multi-step browser flows.
- **Wait for elements:** Use explicit waits for elements to appear or for network requests to complete before proceeding with the next action.
- **Handle dynamic content:** Design your interaction scripts to account for dynamically loaded content and AJAX requests.
- **Screenshot and debugging:** Utilize screenshot capabilities for debugging complex browser interaction flows.

## Use Cases
- **Content aggregation:** Collect articles, product information, or news from multiple sources.
- **Lead generation:** Extract contact information or company details from public websites.
- **Data migration:** Scrape legacy website content for migration to new platforms.
- **Monitoring competitor pricing:** Regularly extract pricing data from competitor websites.
- **Automated testing:** Simulate user journeys for testing web applications.

---

# VoltAgent Project Setup Guide

## CLI Setup
- **Install VoltAgent CLI:** Use `npm` or `yarn` to install the VoltAgent command-line interface globally: `npm install -g voltagent-cli`.
- **Create new project:** Initialize a new VoltAgent project using the CLI: `voltagent create <project-name>`.
- **Select template:** Choose from available project templates (e.g., basic agent, multi-agent workflow, RAG agent) during project creation.
- **Install dependencies:** The CLI will automatically install necessary project dependencies. Run `npm install` or `yarn install` if needed.
- **Run development server:** Start the development server to test your agent: `npm run dev`.

## Manual Setup
- **Create project directory:** Manually create a new directory for your VoltAgent project.
- **Initialize Node.js project:** Run `npm init -y` or `yarn init -y` to create a `package.json` file.
- **Install VoltAgent core:** Install the core VoltAgent library and its dependencies: `npm install @voltagent/core`.
- **Configure TypeScript:** If using TypeScript, set up `tsconfig.json` for proper compilation.
- **Create agent entry point:** Create an `index.ts` (or `index.js`) file to define your main agent instance.
- **Define agent logic:** Implement your agent's `run` method, tools, memory, and guardrails.
- **Add scripts to package.json:** Include `dev` and `start` scripts in your `package.json` for running your agent.

## Project Structure
- **`src/`:** Contains your agent's source code.
- **`src/agents/`:** Directory for specialized agent definitions.
- **`src/tools/`:** Directory for custom tools your agent can use.
- **`src/workflows/`:** Directory for multi-agent workflows.
- **`src/memory/`:** Configuration for memory storage (e.g., vector databases).
- **`config/`:** Configuration files for API keys, environment variables, etc.
- **`.env`:** Environment variables for local development.

## Basic Agent Definition Example
```typescript
// src/index.ts
import { VoltAgent } from '@voltagent/core';

const myAgent = new VoltAgent({
  name: 'MyFirstAgent',
  description: 'A simple agent that greets the user.',
  tools: [], // Add your tools here
  async run(context) {
    context.log('Hello from MyFirstAgent!');
    return 'Agent completed its task.';
  },
});

myAgent.start();
```

---

# Cloud Solution Architect (Azure)

## Design Principles
- **Well-Architected Framework:** Design solutions following the Azure Well-Architected Framework pillars: Cost Optimization, Operational Excellence, Performance Efficiency, Reliability, and Security.
- **Scalability:** Design for horizontal scaling where possible, leveraging Azure services like Virtual Machine Scale Sets, Azure Kubernetes Service (AKS), or serverless functions (Azure Functions).
- **High Availability & Disaster Recovery (HA/DR):** Implement redundant components, availability zones, and regional pairing for critical workloads to ensure business continuity.
- **Security