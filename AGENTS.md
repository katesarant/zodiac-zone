<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep page titles, descriptions and social-preview content on leaf content routes, not the root layout, so unrelated pages cannot inherit a homepage preview; omit explicit social images when no displayed page image qualifies.
- Keep the interpretation cache server-only with no browser-role grants or read policies; validated chart-content lookups preserve generation without exposing the full cache.
- Keep dashboard password configuration server-only with browser-role privileges revoked; the shared-password check must use a credential visitors cannot read or replace.
- Contact challenge tokens contain only a random nonce, timestamp, and keyed answer proof; never encode the expected answer in client-visible tokens, and fail closed without the signing secret.
