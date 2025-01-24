# LLM Actions

LLM Actions is a CLI tool that uses OpenAI's ChatGPT to create & update files and directories on your computer from natural language input.

## Supported actions

- Read file
- Create file
- Create directory
- Create image (only available when OpenAI API key is set)

## How to use

### Prerequisies

- [Node.js](https://nodejs.org/en/)
- [OpenAI API key](https://platform.openai.com/docs/quickstart) (if using OpenAI's models)

### Steps

1. `git clone git@github.com:KennyLindahl/llm-actions.git`

2. Copy `.env.example` to `.env`

   > Add your OpenAI API key (or just use Ollama)

3. Install llm-actions

```
cd llm-actions && npm install && npm link
```

3. Run `llm-actions` in your terminal, for example

```
llm-actions "Create a React application with NextJS"
```

## Known issues

Right now llm-actions might read or create files before it's supposed to.
This has no big consequence more than:

- Reading files: Will send the file to the LLM
  - This will not do anything with the response
- Creating files: Create a file before it has read the content it will try to update
  - It will be overwritten with the next response instead

> This is currently a limit in ChatGPT because it doesn't understand always when it should read or write files. This will improve in further models.
