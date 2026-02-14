# How to Write Great Blog Posts

A guide based on analyzing top developer tools companies (Stripe, Vercel, Slack, Notion, OpenAI, Lovable) and Journium's blog post development process.

## Core Principles

### 1. Narrative Over Bullet Points

**Don't**: Write endless lists of features or bullet points.

**Do**: Tell stories with concrete scenarios that show problems and solutions.

**Why**: Stripe strongly favors narrative writing over bullet points. Their CEO writes emails "formatted like research papers." Narrative forces clarity of thought and makes information more accessible than ephemeral lists.

**Example - Bad**:
```markdown
Benefits:
- Change tracking
- Peer review
- Easy rollback
- CI/CD integration
```

**Example - Good**:
```markdown
Three months after launch, you discover that a critical tracker has been 
quietly misconfigured. It's been analyzing the wrong events. Nobody noticed 
because the change happened in a dashboard somewhere, and there's no record 
of who made it or why.

Version-controlled trackers eliminate this problem. Every tracker is a YAML 
file in your repository—explicit, readable, and subject to the same review 
process as application code.
```

### 2. Problem → Solution Pattern

Open with a real problem developers face, then show how your solution addresses it.

**Structure**:
1. Concrete scenario showing the problem
2. Why this problem matters
3. Solution explanation
4. Real-world impact

**Example**:
```markdown
## The Problem: [Specific Issue]

You're [doing common task]. You [encounter specific problem].

[Explain the loop/frustration this creates]

This isn't an edge case. It's [explain why it's systemic].

## The Solution: [Your Approach]

[Explain solution concisely]

[Show concrete example or code]
```

### 3. Show, Don't Just Tell

Provide concrete examples, code snippets, before/after comparisons. Never just state benefits without demonstrating them.

**Bad**: "The MCP server provides real-time access to documentation."

**Good**: Show a before/after workflow that demonstrates the difference in practice.

## Content Strategy

### What to Include

✅ **Technical Depth**
- Copy-pasteable code examples
- Architecture explanations
- Real configuration files
- Performance considerations
- Trade-offs and limitations

✅ **Developer Experience Focus**
- Getting started quickly
- Real workflows and scenarios
- Troubleshooting common issues
- Links to docs and related resources

✅ **Product Context**
- Why you built this way
- Design decisions and trade-offs
- Backward compatibility notes
- What's coming next

✅ **Concrete Value**
- Specific problems solved
- Measurable improvements
- Real customer scenarios
- Before/after comparisons

### What to Exclude

❌ **Marketing Fluff**
- Buzzwords without substance
- Vague promises
- Sales pitches disguised as content
- Superlatives without proof ("revolutionary," "game-changing")

❌ **Obvious Content**
- "Click this button"
- "Restart your editor after installing"
- "This is a YAML file"
- Basic explanations of industry-standard tools

❌ **Rookie Explanations**
- Don't explain what Git is
- Don't explain what version control does
- Don't explain what an API is
- Assume developer competence

❌ **Repetitive Statements**
- Saying the same benefit three different ways
- Multiple sections making the same point
- Redundant conclusions

## Structure & Length

### Optimal Length by Type

- **Product announcements**: 1,500-2,000 words
- **Technical deep dives**: 2,000-3,000 words
- **Feature launches**: 1,500-2,500 words

**Quality over quantity**: Every paragraph should serve a purpose. If you can delete it without losing value, delete it.

### Structure Template

```markdown
---
title: [Clear, Specific Title]
description: [One-sentence value proposition]
date: YYYY-MM-DD
author: [Name]
---

## Opening (1-2 paragraphs)
- Announce the feature/topic
- State the core value immediately

## The Problem (2-4 paragraphs)
- Concrete scenario showing the problem
- Why current approaches fail
- Impact of the problem

## The Solution (2-3 paragraphs + code)
- How your approach works
- Key technical details
- Working code example

## How It Works (3-5 sections)
- Step-by-step breakdown
- Each section focused on one aspect
- Code examples where relevant

## Why This Matters (3-4 narrative sections)
- Each section tells a story
- Opens with scenario → explains impact
- Concrete benefits demonstrated

## Real-World Experience (optional)
- Before/after comparison
- Actual workflow changes
- Specific improvements

## Technical Details (optional)
- Architecture notes
- Performance characteristics
- Security/privacy considerations

## The Bigger Picture
- Connect to industry trends
- Show broader context
- Future direction

---

[Call to action with links]
```

## Tone & Writing Style

### Voice Characteristics

**Conversational but Authoritative**
- Write like explaining to a colleague
- Use "we" and "you" to create connection
- Confidence without arrogance
- Admit limitations and trade-offs

**Specific Examples by Company**:
- **Stripe**: Precise, systematic, almost academic rigor
- **Vercel**: Enthusiastic but technical, "ship fast" energy
- **Notion**: Approachable, visual, emphasizes flexibility
- **OpenAI**: Research-forward, cautious about implications

**Universal Principles**:
- Respect the reader's time (frontload key info)
- Assume technical competence, not prior knowledge
- Show, don't just tell
- Be honest about limitations
- Make it scannable (headings, code blocks, short paragraphs)

### Sentence Structure

**Keep it tight**:
- Aim for 15-20 words per sentence
- One main idea per paragraph
- Use short paragraphs (3-5 sentences max)
- Break up long sections with code examples

**Active voice over passive**:
- Bad: "The tracker can be configured to run on a schedule"
- Good: "Configure trackers to run on a schedule"

**Remove filler words**:
- "actually," "really," "basically," "essentially"
- "in order to" → "to"
- "is able to" → "can"

### Code Examples

**Format correctly**:
```yaml title=".journium/trackers/example.yml"
# Code with proper syntax highlighting
```

**Make them useful**:
- Copy-pasteable and runnable
- Include necessary context
- Show real examples, not "foo/bar"
- Add inline comments for clarity

## Editing Process

### First Draft
1. Write without editing—get ideas down
2. Focus on narrative and structure
3. Include all technical details
4. Don't worry about length

### Second Pass: Cut Aggressively

Remove:
- ❌ Obvious instructions
- ❌ Repetitive explanations  
- ❌ Marketing language
- ❌ Anything that doesn't add value
- ❌ "This means that..." statements
- ❌ Sections that restate the same point

Ask: "If I delete this paragraph, do I lose important information?" If no, delete it.

### Third Pass: Strengthen Narrative

- ✅ Turn bullet lists into flowing paragraphs
- ✅ Add concrete scenarios to abstract concepts
- ✅ Convert "Feature X does Y" to "When you [scenario], X enables [outcome]"
- ✅ Replace generic statements with specific examples

### Fourth Pass: Technical Accuracy

- Verify all code examples run
- Check links work
- Confirm technical claims
- Test copy-paste examples

### Final Pass: Polish

- Read aloud to catch awkward phrasing
- Check formatting consistency
- Verify heading hierarchy
- Ensure scannable structure

## Common Mistakes to Avoid

### 1. Over-Explaining
**Bad**: "Git is a version control system that tracks changes to files. When you commit changes, Git creates a snapshot..."

**Good**: "Every modification is captured in Git history with full context."

### 2. Feature Lists Disguised as Benefits
**Bad**: "The server provides semantic search, full page retrieval, and structure navigation."

**Good**: "Ask 'how to identify users' and get documentation about user identification, session management, and the identify() method—even if you don't use those exact terms."

### 3. Weak Openings
**Bad**: "We're excited to announce a new feature that we've been working on..."

**Good**: "Three months after launch, you discover that a critical tracker has been quietly misconfigured..."

### 4. Passive Voice Overuse
**Bad**: "Trackers can be configured to run automatically, and they can be triggered manually when needed."

**Good**: "Run trackers automatically on a schedule or trigger them manually on-demand."

### 5. Vague Claims
**Bad**: "This makes development much faster and easier."

**Good**: "Fewer 'that API doesn't exist anymore' moments. Fewer corrections. The AI becomes genuinely helpful because it's working from truth, not probability."

## Markdown Best Practices

### Code Blocks

**Always specify language and title**:
```yaml title=".journium/trackers/example.yml"
apiVersion: journium.app/v0Alpha
kind: InsightTracker
```

**For terminal commands**:
```bash title="Terminal"
git add .
git commit -m "Add tracker"
```

### Diff Syntax

Use `// [!code ++:1]` and `// [!code --:1]` for additions/deletions:

```yaml title=".journium/trackers/example.yml"
spec:
  // [!code --:1]
  schedule: weekly
  // [!code ++:1]
  schedule: daily
```

### Links

**Use descriptive text**, not "click here":
- Bad: Click [here](url) for docs
- Good: See the [tracker repositories documentation](url)

### Headings

- Use sentence case: "Why this matters" not "Why This Matters"
- Make headings descriptive and scannable
- Maximum 3 levels deep (H2, H3, H4)

## Pre-Publication Checklist

- [ ] Title is specific and SEO-friendly
- [ ] Opening paragraph states value immediately
- [ ] No obvious/rookie content
- [ ] Every paragraph adds value
- [ ] Narrative-driven, not bullet-driven
- [ ] Code examples are runnable
- [ ] Links work and point to correct pages
- [ ] No marketing fluff or buzzwords
- [ ] Technical claims are accurate
- [ ] Before/after comparisons are concrete
- [ ] "Why this matters" is demonstrated, not stated
- [ ] File naming follows SEO best practices
- [ ] Frontmatter is complete and correct

## SEO Considerations

### File Naming
Use descriptive, keyword-rich file names:
- ✅ `version-controlled-trackers-insights-as-code-in-practice.mdx`
- ❌ `new-feature-announcement.mdx`

### Title & Description
- **Title**: Clear, specific, includes key terms
- **Description**: One sentence, includes main keywords, under 160 characters

### Content Structure
- Use semantic heading hierarchy (H2 → H3 → H4)
- Include keywords naturally in headings
- First paragraph should include main keywords
- Link to related documentation and resources

## Examples of Great Posts

### Version-Controlled Trackers Post
**What works**:
- Opens with concrete problem scenario
- Shows actual YAML configuration
- Before/after comparison demonstrates value
- Historical context ("The Bigger Picture")
- Assumes reader competence

### MCP Server Post
**What works**:
- Problem stated clearly (AI with stale data)
- Solution explained technically
- Real before/after workflow
- No hand-holding or obvious steps
- Respects reader intelligence

## Resources

- **Stripe's approach**: Narrative writing, footnotes, research-like structure
- **Vercel's SEO guide**: "Depth and clarity matter more than repetition"
- **Developer blog best practices**: Story spine framework, "help first" mentality
- **Model Context Protocol**: https://modelcontextprotocol.io

---

## Quick Reference: Before You Publish

**Ask yourself**:
1. Would I want to read this?
2. Does it respect the reader's time and intelligence?
3. Are there unnecessary sections I can cut?
4. Have I shown, not just told?
5. Is every code example runnable?
6. Does it tell a story or just list features?

**Red flags**:
- More than 3 bullet lists in a row
- Phrases like "This means that..." or "In other words..."
- Explaining what Git/YAML/APIs are
- Marketing superlatives ("revolutionary," "game-changing")
- Obvious instructions ("restart your editor," "click save")

**Green flags**:
- Opens with a concrete problem scenario
- Includes working code examples
- Before/after comparisons
- Honest about trade-offs and limitations
- Readable in one sitting
- Makes you want to try the feature immediately
