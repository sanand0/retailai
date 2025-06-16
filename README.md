# Retail AI Use Cases

[Retail AI Use Cases](http://sanand0.github.io/retailai/) is a slide deck listing LLM use cases in retail.

It includes a [chatbot](http://sanand0.github.io/retailai/chat.html) that can suggest use cases for specific functions. (Log into [LLM Foundry](https://llmfoundry.straive.com/) first.)

## Why?

I was at a [DFI](https://en.wikipedia.org/wiki/DFI_Retail_Group) group event on Fri 13 Jun, 2025, to show how LLMs help in retail.

Rather than use a static standee explaining who we are, we picked an animated slideshow with relevant use cases.

It was not a success. Booths with standees attracted an audience who read from the standee. Ours was too complex, perhaps.

## How?

The application was fully LLM generated.

**STEP 1: [ChatGPT Deep Research](https://chatgpt.com/share/684e2f5a-9d58-800c-b777-347d69b005af)** as well as [Gemini](https://gemini.google.com/) Deep Research to identify use cases.

> Research how the retailer DFI is using and plans to use AI and modern technology.
>
> Research how LLMs are used in retail and are likely to transform the retail industry.
>
> Synthesize these into a comprehensive set of recommendations on use cases and initiatives that DFI will benefit from.
>
> I will be using this at an event at their Singapore office.
>
> Use what you know about me and Straive and previous conversations to see which demos we have created would align with these.

**STEP 2: Convert use cases to JSON**

> Expand the titles so that just reading it will explain the use case more clearly to the audience. For example, instead of Smart SOP Copilot", "Voice Copilot on SOPs for staff on handhelds". Aim for that length.
>
> Descriptions and image prompts are fine.
>
> Now, ensure CAREFULLY that you have not missed any use case in this conversation -- either from you or from me or the other LLM. Include all missing ones in the same style.

This created [`slides.json`](slides.json).

**STEP 3: Add and link demos**

I manually curated a set of demos and asked ChatGPT:

> Given this slides.json and demos.json, update slides.json to add a "demos": ["demo name", "demo name"] element to each slide that lists the best 1-3 demos most closely related to that slide. The "demo name" should EXACTLY match the .demo string in the demos

This updated [`slides.json`](slides.json) with the `"demos":` field.

**STEP 4: Ask Claude Code to generate a slideshow**

I asked [Codex](https://chatgpt.com/codex) first but the result was bad. Hence [Claude Code](<](https://docs.anthropic.com/en/docs/claude-code/overview)>).

> Create an index.html and script.js that fetches slides.json and renders it as a RevealJS slideshow. The title should be on top. The description should alternate between left or right. The image should be on the other side. image_description is the alt-text. The image aspect ratio may vary. Ensure that it fits in the container size without aspect ratio distortion.
>
> Make the slideshow really impressive and professional. Add a gentle particlesJS effect in the background.
>
> Add a page number on all slides. Show a subtle "Retail AI use cases" watermark acoss slides.

But RevealJS proved too restrictive. So I replaced it with a custom slideshow.

> Create an index.html and script.js that fetches slides.json and renders it as a slideshow.
>
> The title should be on top. The description should alternate between left or right. The image should be on the other side. image_description is the alt-text. The image aspect ratio may vary. Ensure that it fits in the container size without aspect ratio distortion.
>
> Make the slideshow really impressive and professional. Add a gentle particlesJS effect in the background. Use left/right arrow keys to SMOOTHLY transition across slides. Make the transition look like the slides are moving left/right very smoothly and professionally.
>
> Add a page number on all slides. Show a subtle "Retail AI use cases" watermark acoss slides.
>
> - Write SHORT, CONCISE, READABLE code
> - Deduplicate maximally. Use iteration, higher-order functions, vectorization
> - Avoid validation and exception handling.
> - Use functions, not classes
> - Use ESM: <script type="module">
> - Use MODERN JavaScript. Minimize libraries
> - Use CSS frameworks as required
> - Use hyphenated HTML class/ID names (id="user-id" not id="userId")
> - Use .insertAdjacentHTML / .replaceChildren (or lit-html). Avoid document.createElement

**STEP 5: Ask Claude Code to modify the slideshow**

This worked quite well. I only needed to make tweaks thereafter, like:

> - Make the particles a bit more prominent
> - Make the description text have a darker (not lighter) background -- for contrast
> - Move the slide number to the bottom right
> - Space should move to the next slide
> - Pressing "P" should toggle auto-play and pause option. Add this to the current instructions on screen along with arrow keys instruction
> - Change the URL hash as the slides move without affecting history. Reloading the page should load the same slide

... and:

> I have updated slides.json to have { slides: [{title, description, image_prompt, image, demos: [demo, demo}}, ...], demos: [{demo, description, link, ...}] }
>
> I also modified script.js and index.html a bit.
>
> Now, show small buttons at the bottom of each slide that opens the relevant demo link. Show the demo name in the button. Hovering should show the description. Links should open in a new window. Make sure the buttons have high contrast and a font size of 1.25rem. Lay out the buttons at the bottom left of the screen.

... and:

> Visually show a small play/pause indicator at the top right

... and finally:

> In index.html, make the "Retail AI use cases more prominent. Move it to the center, below the arrow instructions.
>
> The slides are moving a bit too fast. Slow them down. Secondly, add a new slide focusing on commercial that will be relevant to a retailer. Begin with this new slide. Follow the same style as the existing code.

**STEP 6: Ask Claude Code to create a chat interface**

> Create a chat.html and chat.js that allows the user to type in a textarea or speak (using Web Speech API) to an LLM.
>
> Stream the answer to the user question.
>
> This will be used at an event in a booth on a large screen, so keep font sizes large and prominent.
>
> As part of the system prompt, direct the LLM to answer the question concisely referencing the provided content. Pass it the contents of slides.json - reformatted suitable for an LLM.
>
> Call OpenAI's GPT 4.1 Mini as the model using:
>
> ```js
> import { asyncLLM } from "https://cdn.jsdelivr.net/npm/asyncllm@2";
>
> for await (const { content, error } of asyncLLM("https://llmfoundry.straive.com/openai/v1/chat/completions", {
>   method: "POST",
>   headers: { "Content-Type": "application/json" },
>   credentials: "include",
>   body: JSON.stringify({
>     model: "gpt-4.1-mini",
>     messages: [
>       { role: "system", content: "[INSERT SYSTEM PROMPT]" },
>       { role: "user", content: "[INSERT USER MESSAGE]" }
>     ],
>     // response_format: "json_object",  // forces JSON response
> })) {
>   // content has the full (not delta) content. Render as Markdown using marked
>   // error has an error in case the stream failes
> }
> ```

... and then a few modifications:

> In chat.html, have the LLM generate links to demos when mentioning demos.
> In chat.js ensure that all links open in a new window

---

That's it!
