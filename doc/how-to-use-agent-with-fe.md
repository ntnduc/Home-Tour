You can run the pipeline in two ways: automatically with the UI Pipeline agent, or one stage at a time with the slash commands.

Before you start (one time)
Open the workspace file. Use home-tour.code-workspace. In a multi-folder window, the chat settings are read from there.
Pick the Local agent in the Chat view, not the Agent Host. VS Code's docs say Agent Host sessions don't load prompt files. Handoff buttons and subagents in this setup are also configured for the Local agent. This chat runs on the Agent Host, so switch.
Check that the agents loaded. Type /ui in chat and you should see /ui-planner, /ui-coder and /ui-reviewer. The agents dropdown should list UI Planner, UI Coder, UI Reviewer and UI Pipeline.
Check the model names. If a model named in the files isn't in your model picker, change the model: line in the matching file under .github/agents/ or .github/prompts/.
Agent files list several models and VS Code uses the first one available.
Prompt files name only one model.

Option 1 — Automatic: UI Pipeline agent
Choose UI Pipeline in the agents dropdown and type your request:
What happens:
Planner (Opus) writes the plan to .github/ui-blueprints/20261006-invoice-history.md and shows a short summary.
You approve with Approve blueprint, or choose Revise plan and say what to change. Add auto to your request to skip this step.
Coder (Haiku) implements the plan and runs the type check, the colour check and the iOS bundle.
Reviewer (Opus) returns either APPROVED or REVISION NEEDED with a list of fixes.
If a revision is needed, the Coder fixes only those items and the Reviewer checks again, up to 3 rounds.
Each stage runs in its own separate context and only receives the plan's file path. The expensive model plans and reviews, and the cheap model writes the code.

For subagents, VS Code won't use a model that is more expensive than the main chat model. The orchestrator is set to Opus for that reason, so keep it on your strongest model.

Option 2 — One stage at a time with slash commands
Using a new chat for each stage keeps token use lowest.

Chat 1 — Plan
The reply is short and points to the plan file:
Read the plan file and edit it by hand if you want something different. It's an ordinary Markdown file.

Chat 2 — Code
The reply is a short report:

Chat 3 — Review
The verdict is added to the plan file's Review log, for example:
If it says REVISION NEEDED: run /ui-coder <same path> again. The Coder sees the plan's revision status and fixes only those items. Then run /ui-reviewer <same path> until you get APPROVED.
Instead of typing the next command, you can click the handoff button shown after each reply (▶ Stage B, 🔍 Stage C, 🔧 Apply revision). It's faster, but the conversation history comes along, so it uses more tokens than starting a new chat.

Tips
Smaller UI changes: you don't need the pipeline. The design rules in mobile-ui-design.instructions.md are applied automatically to every .tsx file the agent edits.
Write clear requests. Name the screen, the data it shows and the main actions. The Planner asks you at most one question.
After you accept the result, ask for the history entry as usual. The agents don't create history files themselves.
Task completed: Explained how to run the UI pipeline, either automatically with the UI Pipeline agent or stage by stage with /ui-planner, /ui-coder and /ui-reviewer, with a worked invoice-history example. It needs the Local agent (not the Agent Host) and may need model names adjusted to match your picker.