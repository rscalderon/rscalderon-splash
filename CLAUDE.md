# Repository conventions

## Commit attribution (required)

Every commit in this repository MUST credit rscalderon as co-author. End every
commit message with this exact trailer:

```
Co-Authored-By: rscalderon <127636148+rscalderon@users.noreply.github.com>
```

This applies to all commits, including merge commits and commits authored by
AI agents or other tools. A `prepare-commit-msg` hook in `.githooks/` appends
the trailer automatically once hooks are enabled (`pnpm install` does this via
the `prepare` script, or run `git config core.hooksPath .githooks` manually),
but include the trailer explicitly in case the hook is not installed.
