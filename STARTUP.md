# Claude Code Session Startup Procedure

This document provides a structured approach to beginning each development session, ensuring context continuity and clear objectives.

## Core Startup Steps

### 1. **Context Loading & Assessment**
- [ ] **Read Project Instructions**: Open and review `CLAUDE.md` to understand current project state
- [ ] **Review Previous Session**: Read `LAST_SESSION_SUMMARY` to understand what happened previously
- [ ] **Check Repository State**: Run `git status` to understand current working directory state
- [ ] **Verify Environment**: Confirm all required tools and credentials are available

### 2. **Create Session Working Document**
- [ ] **Generate THIS_SESSION.md**: Create today's session document using the template structure
- [ ] **Set Session Date**: Update document title with current date
- [ ] **Initialize Section Headers**: Ensure all required sections are present and ready

### 3. **Structured Session Planning**
Execute these three discussions in sequence with the user:

#### Discussion 1: **Lookback on Last Session**
**Guided Questions to Explore:**
- What were we trying to accomplish in the previous session?
- How did that work go? What succeeded and what didn't?
- What technical concepts or patterns did we learn?
- Were there any blockers or unresolved issues?
- What insights should influence today's approach?

**Document the Conversation**: Record key insights in `THIS_SESSION.md` under "Lookback on last session"

#### Discussion 2: **This Session Objectives**
**Collaborative Goal Setting:**
- What specific outcomes do we want to achieve today?
- Are these objectives realistic for a single session?
- How do these goals relate to the overall project progression?
- What would constitute "success" for this session?
- Are there any constraints or dependencies to consider?

**Document the Agreement**: Record agreed objectives in `THIS_SESSION.md` under "This session: Objectives"

#### Discussion 3: **Session Planning**
**Strategic Planning Discussion:**
- What's the step-by-step approach to achieve our objectives?
- What are the potential risks or complications?
- How should we prioritize if we can't complete everything?
- What tools, resources, or information do we need?
- How will we track progress during the session?

**Document the Plan**: Record the detailed plan in `THIS_SESSION.md` under "This session: Plan"
**Use Planning Mode**: Additionally, use Claude Code's planning mode to present the technical implementation plan for user approval

### 4. **Session Initialization Complete**
- [ ] **Plan Approved**: User has reviewed and approved the session plan
- [ ] **Clear Objectives**: Both parties understand what success looks like
- [ ] **Context Captured**: All relevant information from previous sessions has been considered
- [ ] **Ready to Execute**: Technical plan is clear and actionable

## Template for THIS_SESSION.md

When creating the session document, use this exact template:

```markdown
# This Session - [YYYY-MM-DD]

## Lookback on last session
- What were we trying to do?
- How did it go?
- What did we learn?

## This session: Objectives
- What do we want to have achieved?

## This session: Plan
- What's the plan for how to achieve that?

## This session: Notes
- Log of broadly what we have done and learned
```

## Advanced Startup Considerations

### 5. **Project-Specific Context**
- [ ] **Review Recent Commits**: Check `git log --oneline -10` for recent changes
- [ ] **Check for Urgent Issues**: Look for any critical blockers or security alerts
- [ ] **Verify Dependencies**: Ensure external services, APIs, or tools are accessible
- [ ] **Review Documentation Updates**: Check if project specifications or requirements have changed

### 6. **Learning Continuity**
- [ ] **Connect to Previous Learning**: Reference global `LEARNING_LOG.md` in template repository
- [ ] **Identify Learning Opportunities**: What concepts might we encounter today?
- [ ] **Prepare for Knowledge Transfer**: Consider what insights might be worth documenting

### 7. **Quality and Security Readiness**
- [ ] **Security Validation**: Run `./scripts/security-check.sh` to ensure clean starting state
- [ ] **Test Environment**: Verify that testing and validation tools are working
- [ ] **Backup Considerations**: Ensure work can be safely committed and pushed

## Emergency Startup

For abbreviated sessions or when time is limited:

### Minimal Viable Startup
1. **Quick Context**: Skim `LAST_SESSION_SUMMARY` for immediate context
2. **Set Basic Objective**: Define one clear, achievable goal for the session
3. **Simple Plan**: Create 3-5 step plan to achieve the objective
4. **Begin Work**: Start execution with the understanding that full documentation comes later

### Recovery from Incomplete Sessions
- Use `git log` and any existing `THIS_SESSION.md` to understand context
- Check for WIP commits that need completion
- Review any TODO comments in code for immediate next steps
- Prioritize completing interrupted work before starting new initiatives

## Session Continuity Principles

### Structured Communication
- **Always start with context**: Don't assume memory from previous sessions
- **Be explicit about objectives**: Vague goals lead to unfocused sessions
- **Plan before executing**: 10 minutes of planning saves hours of wandering

### Knowledge Management
- **Document insights immediately**: Don't rely on memory for technical discoveries
- **Connect new learning to existing knowledge**: Build on previous understanding
- **Prepare for interruption**: Assume every session might end unexpectedly

### Quality Standards
- **Maintain security practices**: Never compromise on credential management or secret detection
- **Keep git history clean**: Make meaningful commits with clear messages
- **Document decisions**: Record the reasoning behind technical choices

## Integration with CLOSEDOWN.md

This startup procedure is designed to work seamlessly with the closedown procedure:
- **Startup creates structure** → **Session executes plan** → **Closedown archives and transfers knowledge**
- **Session documents feed closedown process**: `THIS_SESSION.md` becomes the source for session summaries
- **Global knowledge sync**: Learning insights flow from session to global template repository

---

**Remember**: The goal is not perfect documentation, but rather consistent context transfer and clear intentionality in each development session. Adapt this procedure to match the specific needs of your project and working style.