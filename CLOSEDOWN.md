# Claude Code Session Closedown Procedure

This document provides a structured approach to ending each development session, ensuring proper knowledge transfer and clean project state for the next session.

## Core Closedown Steps

Execute these steps in sequence, using Claude Code's planning methodology where appropriate:

### 1. **Session Summary Creation**
- [ ] **Review THIS_SESSION.md**: Assess what was accomplished during the session
- [ ] **Extract Key Points**: Identify the most important outcomes, learnings, and decisions
- [ ] **Create Session Summary**: Condense THIS_SESSION.md content into a concise summary
- [ ] **Append to ROLLING_NOTES**: Add the session summary to the cumulative session archive
- [ ] **Prepare LAST_SESSION_SUMMARY**: Create focused summary for the next session startup

### 2. **Knowledge Transfer & Documentation Updates**
- [ ] **Update Project CLAUDE.md**: Add any project-specific learnings or process improvements
- [ ] **Update User CLAUDE.md**: Add any global principles or preferences discovered (~/.claude/CLAUDE.md)
- [ ] **Update Global Learning Log**: Add technical insights to claude-project-template repository
- [ ] **Sync Template Repository**: Copy updated user CLAUDE.md to claude-project-template for reuse

### 3. **Repository State Management**
- [ ] **Commit Working Changes**: Ensure all meaningful work is committed to git
- [ ] **Clean Workspace**: Remove temporary files, failed experiments, or test artifacts  
- [ ] **Clean Development Artifacts**: Remove screenshots, test files, debug outputs, and temporary dev files
- [ ] **Check Git Status**: Run `git status` to verify clean working directory

### 4. **Dual Commit Strategy**
- [ ] **Commit Work Changes**: Create commit for functional changes, features, or bug fixes made during session
- [ ] **Commit Learning Changes**: Separate commit for documentation updates, learning insights, and process improvements
- [ ] **Use Descriptive Messages**: Ensure commit messages clearly explain both what was changed and why
- [ ] **Push to Remote**: Ensure all commits are pushed to GitHub/remote repository

### 5. **Session Processing & Cleanup**
- [ ] **Process THIS_SESSION.md**: Extract key insights and progress for ROLLING_NOTES.md
- [ ] **Delete THIS_SESSION.md**: Remove completed session document from project root
- [ ] **Clean Working Directory**: Ensure no temporary session files remain

### 6. **Global Template Repository Sync**
- [ ] **Navigate to Template Repo**: Switch to `/home/modha/claude-project-template/` directory
- [ ] **Update Global CLAUDE.md**: Copy user-level preferences from `~/.claude/CLAUDE.md`
- [ ] **Commit Template Updates**: Commit any global learning or preference changes
- [ ] **Return to Project**: Switch back to project directory

### 7. **Quality Assurance & Security**
- [ ] **Security Validation**: Run `./scripts/security-check.sh` to ensure no secrets exposed
- [ ] **Code Quality**: Remove debug code, temporary variables, or test artifacts
- [ ] **Test Status**: Document which tests are passing/failing and any issues discovered
- [ ] **Configuration Security**: Verify no credentials in configuration files

### 8. **Next Session Preparation**
- [ ] **Clear Starting Point**: Ensure next session has obvious entry point and context
- [ ] **Priority Documentation**: Document most important items for next session
- [ ] **Blocker Identification**: Note any dependencies or blockers that need resolution
- [ ] **Resource Availability**: Ensure all necessary tools and access remain available

## Emergency Closedown

For abbreviated sessions or emergency situations:

### Minimal Viable Closedown
1. **Quick Summary**: Create brief summary of session in THIS_SESSION.md notes
2. **Commit Current State**: `git add . && git commit -m "WIP: [brief description]"`
3. **Push to Remote**: `git push` to ensure work is backed up
4. **Mark Incomplete**: Note in commit message or documentation that work is incomplete
5. **Set Recovery Notes**: Add TODO comments in code for easy session recovery

### Structured Closedown Process

Execute these steps using Claude Code's planning methodology:

#### Planning Phase
1. **Review Session Accomplishments**: Assess what was completed vs. objectives
2. **Identify Key Learning**: Determine what insights should be preserved
3. **Plan Documentation Updates**: Decide which files need updates
4. **Organize Commit Strategy**: Plan how to separate work commits from learning commits

#### Execution Phase
5. **Execute Documentation Plan**: Update all identified documentation
6. **Execute Commit Strategy**: Make planned commits with clear messages
7. **Execute Archive Process**: Move session documents to appropriate locations
8. **Execute Template Sync**: Update global knowledge repositories

#### Verification Phase
9. **Verify Clean State**: Ensure repository is clean and ready for next session
10. **Verify Knowledge Transfer**: Confirm all important insights are documented
11. **Verify Next Session Readiness**: Ensure clear starting point exists

## Verification Checklist

### Pre-Closedown Verification
- [ ] All meaningful work is committed and pushed
- [ ] Documentation accurately reflects current state
- [ ] No sensitive information is exposed in repository
- [ ] Next session has clear starting point and objectives
- [ ] Project can be successfully cloned and set up by following documentation

### Quality Gates
- [ ] Code builds/runs successfully
- [ ] Basic functionality tests pass
- [ ] Documentation is coherent and up-to-date
- [ ] Git history is clean and meaningful
- [ ] Dependencies are properly managed

## Emergency Checkpointing

For abbreviated sessions or emergency situations:

### Minimal Viable Checkpoint
1. **Quick commit**: `git add . && git commit -m "WIP: [brief description]"`
2. **Push to remote**: `git push`
3. **Quick note**: Add single line to SESSION_NOTES.md describing current state
4. **Mark WIP**: Use commit message prefixes like "WIP:", "DRAFT:", or "INCOMPLETE:"

### Recovery from Incomplete Checkpoint
- Use git log and SESSION_NOTES.md to understand last session
- Check for WIP or DRAFT commits that need completion
- Review CLAUDE.md for stated objectives vs. actual progress
- Identify any hanging dependencies or incomplete workflows

## Template for SESSION_NOTES.md Updates

```markdown
## Session [Date/Number]: [Brief Description]

### Accomplished ✅
- [Specific achievements]
- [Features completed]  
- [Bugs fixed]

### In Progress 🚧
- [Work started but not completed]
- [Partially implemented features]

### Blocked/Issues ⚠️
- [Dependencies or blockers]
- [Technical issues encountered]

### Next Session Priorities 🎯
- [Immediate next steps]
- [High-priority items]

### Notes & Learnings 📝
- [Important insights]
- [Resources discovered]
- [Decisions made]
```

## Integration with STARTUP.md

This closedown procedure is designed to work seamlessly with the startup procedure:

### Session Flow Integration
- **STARTUP.md creates session structure** → **Session executes against plan** → **CLOSEDOWN.md processes session results**
- **Knowledge flows forward**: Session insights become input for next session's startup
- **Clean handoff**: Each closedown creates the context needed for next startup

### File Lifecycle
1. **STARTUP.md** guides creation of **THIS_SESSION.md**
2. **THIS_SESSION.md** serves as working document during session
3. **CLOSEDOWN.md** processes **THIS_SESSION.md** content into **ROLLING_NOTES.md**
4. **THIS_SESSION.md** is deleted after processing
5. **LAST_SESSION_SUMMARY** provides focused context for next **STARTUP.md** process

### Knowledge Repository Flow
- **Local Learning** → **Project CLAUDE.md** (project-specific insights)
- **Global Learning** → **User CLAUDE.md** (cross-project principles)  
- **Technical Learning** → **Template LEARNING_LOG.md** (reusable technical knowledge)

## Quality Assurance

### Final Verification Checklist
- [ ] **All work committed**: No uncommitted changes remain
- [ ] **Documentation current**: All files reflect actual project state
- [ ] **Security clean**: No secrets or credentials exposed
- [ ] **Next session ready**: Clear starting point and context available
- [ ] **Knowledge preserved**: Important insights documented in appropriate locations
- [ ] **Session processed**: THIS_SESSION.md content integrated into ROLLING_NOTES.md

### Success Criteria
A successful closedown should ensure that:
1. **Another person** could understand project status from documentation
2. **Future sessions** have clear context and starting points
3. **Knowledge gained** is preserved and accessible
4. **Security standards** are maintained throughout
5. **Project momentum** is preserved across session boundaries

## Session Management Philosophy

### Structured Communication
- **Document decisions**: Don't rely on memory for important choices
- **Preserve context**: Assume every session might be the last for a while
- **Build knowledge**: Each session should add to cumulative understanding

### Quality Over Speed
- **Better documentation**: 10 minutes of closedown saves hours of context rebuilding
- **Clean commits**: Meaningful commit messages are documentation
- **Security first**: Never compromise on credential management for speed

### Continuous Improvement
- **Adapt procedures**: Modify these processes based on what works in practice
- **Learn from issues**: When sessions end poorly, update procedures to prevent recurrence
- **Share insights**: Global learning should benefit all future projects

---

**Remember**: The goal is seamless session continuity and knowledge preservation. A well-executed closedown makes the next startup effortless and productive. 