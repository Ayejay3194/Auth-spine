# External Dependencies

This directory contains external libraries and dependencies as git submodules.

## nlp.js

**Repository:** https://github.com/axa-group/nlp.js.git  
**Type:** Git Submodule

**Description:** NLP.js is a natural language processing library built in Node.js. It provides tools for:
- Natural Language Understanding (NLU)
- Natural Language Processing (NLP)
- Intent classification
- Entity extraction
- Language detection
- Sentiment analysis
- And much more

**Integration Purpose:** This library is being integrated with the Auth-spine NLU engine to enhance natural language understanding capabilities for the smart assistant system.

### Setup

If you just cloned this repository, initialize the submodule:

```bash
git submodule update --init --recursive
```

Or use the convenience script:

```bash
./scripts/setup-nlp.sh
```

### Updating

To update nlp.js to the latest version:

```bash
cd external/nlp.js
git pull origin master
cd ../..
git add external/nlp.js
git commit -m "Update nlp.js submodule"
```

### Usage

The nlp.js library can be imported and used in the NLU engine located at:
- `packages/enterprise/nlu/nlu-engine.ts`
- `packages/enterprise/nlu/nlu-integration.ts`

### Documentation

Full documentation for nlp.js can be found at:
- [GitHub Repository](https://github.com/axa-group/nlp.js)
- [Official Documentation](https://github.com/axa-group/nlp.js/blob/master/docs/v4/README.md)

### License

nlp.js is licensed under the MIT License. See `nlp.js/LICENSE.md` for details.
