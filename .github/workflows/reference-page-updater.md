---
on:
  schedule: weekly on monday
permissions:
      contents: read
      issues: read
      pull-requests: read
engine: copilot
network:
  allowed:
    - defaults
    - node
tools:
  github:
    toolsets: [default]
  edit:
  web-fetch:
  web-search:
safe-outputs:
  create-pull-request:
---

# reference-page-updater

I want to search for any relevent links about github agentic workflows to ensure we hve the latest in our references page. I do care about the sources so make sure sources are trust worthy. Preferably sources like github.com, microsoft, but honestly you will need to be the best judge becuase we want everyone one to talk about it...

<!--
## TODO: Customize this workflow

The workflow has been generated based on your selections. Consider adding:

- [ ] More specific instructions for the AI
- [ ] Error handling requirements
- [ ] Output format specifications
- [ ] Integration with other workflows
- [ ] Testing and validation steps

## Configuration Summary

- **Trigger**: Weekly schedule (Monday, fuzzy scattered time)
- **AI Engine**: copilot
- **Tools**: github, edit, web-fetch, web-search
- **Safe Outputs**: create-pull-request
- **Network Access**: defaults,node

## Next Steps

1. Review and customize the workflow content above
2. Remove TODO sections when ready
3. Run `gh aw compile` to generate the GitHub Actions workflow
4. Test the workflow with a manual trigger or appropriate event
-->
