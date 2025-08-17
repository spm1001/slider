# Claude Code Session Checkpointing Procedure

This document provides a comprehensive procedure for properly closing a Claude Code session and checkpointing state for continuity across sessions.

## Core Checkpointing Steps

### 1. **Repository State Management**
- [ ] **Commit Working Changes**: Ensure all meaningful work is committed to git
- [ ] **Clean Workspace**: Remove temporary files, failed experiments, or test artifacts
- [ ] **Check Git Status**: Run `git status` to verify clean working directory
- [ ] **Push to Remote**: Ensure all commits are pushed to GitHub/remote repository

### 2. **Documentation Updates**
- [ ] **Update CLAUDE.md**: Reflect current project status, completed features, and next steps
- [ ] **Update SESSION_NOTES.md**: Document what was accomplished, lessons learned, and immediate next actions
- [ ] **Update Project README**: If significant progress was made, update main documentation
- [ ] **Document Blockers**: Clearly identify any blockers or dependencies for next session

### 3. **Code Organization & Quality**
- [ ] **Separate Concerns**: If uncommitted changes span different conceptual tasks, break into distinct commits
- [ ] **Remove Debug Code**: Clean up console.log statements, temporary variables, or test code
- [ ] **Code Comments**: Add explanatory comments for complex logic implemented in the session
- [ ] **Dependency Management**: Update package.json or equivalent if new dependencies were added

### 4. **Environment & Configuration**
- [ ] **Configuration Files**: Update any .env.template, config.sample, or setup instructions
- [ ] **Credentials Security**: Ensure no secrets or API keys are committed to version control
- [ ] **Environment Documentation**: Update setup instructions if environment requirements changed
- [ ] **MCP/Tool Configuration**: Document any new tool configurations or MCP server updates

## Advanced Checkpointing for Complex Projects

### 5. **State Preservation for Continuity**
- [ ] **Active Branch Documentation**: Note which git branch contains active work
- [ ] **Work-in-Progress**: If leaving work unfinished, create detailed TODO comments in code
- [ ] **Test Status**: Document which tests are passing/failing and why
- [ ] **Performance Notes**: Record any performance observations or optimization opportunities

### 6. **Cross-Session Context**
- [ ] **Decision History**: Document key architectural or implementation decisions made
- [ ] **Failed Approaches**: Note approaches that were tried and why they didn't work
- [ ] **Resource Links**: Update documentation with any helpful resources discovered
- [ ] **Tool/Library Evaluation**: Document evaluation of tools, libraries, or approaches

### 7. **Collaboration Preparation**
- [ ] **Code Review Readiness**: Ensure code is in a state suitable for review
- [ ] **Deployment Notes**: Update deployment instructions or automation
- [ ] **Issue Tracking**: Create or update GitHub issues for next development cycles
- [ ] **Documentation for Others**: Ensure documentation enables others to contribute

## Specialized Checkpointing Scenarios

### 8. **Long-Running Development**
- [ ] **Milestone Documentation**: Document progress toward major milestones
- [ ] **Technical Debt**: Note accumulated technical debt and remediation plans
- [ ] **Refactoring Opportunities**: Document code that should be refactored in future sessions
- [ ] **Performance Baseline**: Record performance metrics if relevant

### 9. **Multi-Environment Projects**
- [ ] **Environment Status**: Document status across development, staging, production environments
- [ ] **Configuration Sync**: Ensure configuration files are synchronized across environments
- [ ] **Deployment State**: Document current deployment status and any pending deployments
- [ ] **Database/External Services**: Note state of external dependencies

### 10. **Learning & Knowledge Transfer**
- [ ] **Lessons Learned**: Document new concepts or techniques learned during session
- [ ] **Reference Materials**: Update links to documentation, tutorials, or resources used
- [ ] **Best Practices**: Note any best practices discovered or patterns established
- [ ] **Problem-Solving Notes**: Document complex problems solved and solution approaches

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

This comprehensive checkpointing procedure ensures seamless continuity across Claude Code sessions and maintains project momentum regardless of session interruptions. 