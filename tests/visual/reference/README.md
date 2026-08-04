# Approved WordPress visual references

These ten images are the tracked desktop (`1440px`) and mobile (`390px`) captures for the
five golden routes in `tests/helpers/site.ts`. They were promoted on 2026-08-04 from the
previously verified `output/playwright/reference` set, captured through the host environment
that resolves `http://trayport.local` to the real WordPress application.

Do not update them from a Linux/WSL host until the route-heading validation in
`visual-regression.e2e.spec.ts` passes. In the current local network configuration, Linux can
resolve `trayport.local` to an Apache default vhost while the Windows browser resolves the real
site. The explicit heading assertion prevents that wrong vhost from being accepted.

Refresh references only with:

```bash
pnpm visual:update-reference
```

When WSL resolves `trayport.local` to the wrong local vhost, point the test at an explicitly
audited read-only forwarder without changing the public URL under test:

```bash
docker run --detach --rm --name trayport-reference-nginx \
  --network proxy \
  --publish 127.0.0.1:3090:3090 \
  --volume "$PWD/tests/visual/reference/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:alpine

PLAYWRIGHT_REFERENCE_PROXY_ORIGIN=http://127.0.0.1:3090 pnpm visual:update-reference
docker stop trayport-reference-nginx
```

The visual test rewrites only `trayport.local` and forwarder-origin requests. The audited forwarder
must set the upstream `Host: trayport.local` header itself; Chromium does not reliably preserve a
browser-side Host override across WordPress canonical redirects. Never use an unaudited forwarder
for baseline promotion.

Review every changed PNG before commit. Reference updates are deliberately separate from
the normal candidate comparison command.

## Known capture limitations

These images are regression anchors, not permission to reproduce a capture failure. The promoted
WordPress set contains transient cookie state, fade-in elements that remained transparent, and
native lazy media that was never intersected. Fresh settled browser inspection proves that Home
and Joule product media, the Home video, testimonials, client logos, Joule Benefits, and Related
Products are real visible content. The live `trayport.local` page is authoritative whenever a
tracked image shows a suspicious blank region.

Reference and candidate acceptance therefore waits for fonts, disables transition/animation
timing, performs an eager scroll pass, and rejects failed visible images before capture. The legacy
Insights mobile page also has an extreme narrow-layout failure and must not be treated as a target;
the responsive repair is recorded as an intentional improvement. German Power attachment `9727`
and the related missing Insights attachment `9698` were later recovered byte-for-byte from the
audited reference origin by accepted run `media-recovery-parity-20260804-1632`. Their SHA-256 hashes,
sizes, source URLs, and run-local binaries are now validated before load; the schematic German Power
bridge is no longer the candidate presentation. The tracked WordPress PNG remains unchanged.

The live WordPress theme also renders the Home, Joule, and Insights hero titles as non-heading
elements at its mobile breakpoint. Reference capture therefore verifies their exact visible text
inside `main`; candidate capture still requires the semantic page title to be an `h1`. Two
route-scoped legacy image failures are allowlisted only while capturing WordPress: German Power's
missing attachment (`AdobeStock_525262198-scaled.jpeg`) and the missing Insights card rendition
(`AdobeStock_1281989703-1024x490.jpeg`). Both URLs were re-audited as HTTP 404 on 2026-08-04.

## SHA-256 at promotion

```text
07408e08badb32cd1ab43d73bd7278c88aaecc63ded8b868e2d2f345e812e656  visual-desktop/eex.png
447a61dc32ccb89ae84643af75c803a740546e9a275ff4fc727249d7b9447e53  visual-desktop/german-power.png
68becda127762c3d106028d4ace2c96c861cd4fd2858d030565831a972ab5402  visual-desktop/home.png
7796cb603d108541789b2d8dbbc3003e1e594b4036d5f776f158a208c3340e7c  visual-desktop/insights.png
414c035a0721954b58fbe756708449580a5fdbdfb121dff866d193c4399c3805  visual-desktop/joule.png
105d4b8997cb7218c5043defca3844f6a40d03e6fb3b4a458490ef5a91d4f04a  visual-mobile/eex.png
f29098bac5c225a4ebd6143098cd2a52697380585a4708300f893f26bb92c402  visual-mobile/german-power.png
2f45d500cdcca75578ba05ea897bb1d33db18986ca4705075c301f9b15bb5ce5  visual-mobile/home.png
2dd639f47258e9118c2b4fb818ef40a78724162f026865830ffb3ceb3d894972  visual-mobile/insights.png
7694adbae9022fba32e226c35a6a883a7fabf62330f2f630a618e39b6c8d3ef1  visual-mobile/joule.png
```
