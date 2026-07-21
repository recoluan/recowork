# Initialize RecoWork Through An AI Agent

Use this prompt only in a command-capable local agent.

```text
Initialize the RecoWork template [general-ai-workflow | idea-engineering | learning-engineering | project-engineering] for the [local-agent-project] environment in [zh | en] at [destination].

First check whether Node.js and npm are available. If either is missing or outdated, explain why it is needed and ask for my confirmation before installing the latest stable Node.js. After confirmation, run:

npx recowork add [template] --target local-agent-project --locale [locale] [destination]

Inspect the generated output. Do not create platform-specific skills or configuration folders. Read AGENTS.md and tell me the first decision or confirmation needed before meaningful work begins.

Repository source: https://github.com/reco-dev/recowork
```

For a web or mobile chat, initialize `chat-mobile` with the CLI from another machine or copy the chat target materials from the repository. Do not ask a pure chat environment to install Node.js or create local files.
