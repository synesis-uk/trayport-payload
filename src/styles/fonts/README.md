# Inter 4.1 web fonts

These files are deterministic subsets of the exact Inter 4.1 variable fonts served by the
WordPress reference. They are checked in so production does not depend on `rsms.me` or on a
package that may contain a different Inter generation.

Upstream files:

| Face           | URL                                                                                            |  Bytes | SHA-256                                                            |
| -------------- | ---------------------------------------------------------------------------------------------- | -----: | ------------------------------------------------------------------ |
| Normal         | `https://raw.githubusercontent.com/rsms/inter/v4.1/docs/font-files/InterVariable.woff2`        | 352240 | `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3` |
| Italic         | `https://raw.githubusercontent.com/rsms/inter/v4.1/docs/font-files/InterVariable-Italic.woff2` | 387976 | `e564f652916db6c139570fefb9524a77c4d48f30c92928de9db19b6b5c7a262a` |
| Static regular | `https://raw.githubusercontent.com/rsms/inter/v4.1/docs/font-files/Inter-Regular.woff2`        | 111268 | `e06f6b1bc553aaea4e4668023ed0ab0a147129c3107f511bc7d03d361b0ae085` |
| Static bold    | `https://raw.githubusercontent.com/rsms/inter/v4.1/docs/font-files/Inter-Bold.woff2`           | 114840 | `fa888127b6da015b65569f0351f3b5c391ad928904951f1c20e9f8462a8d95ea` |

Checked-in subsets:

| File                                         |  Bytes | SHA-256                                                            |
| -------------------------------------------- | -----: | ------------------------------------------------------------------ |
| `inter-v4.1-latin-variable-normal.woff2`     | 105896 | `912025911cfbd8d1da955b543eabc79bcd07ceded63c2a8ba39a7adf1768a4c5` |
| `inter-v4.1-latin-variable-italic.woff2`     | 116340 | `e786bf233dddee31fa7b581dbe73fddc265b3c52e00ac19c7db673ce16d20240` |
| `inter-v4.1-latin-ext-variable-normal.woff2` | 142564 | `2cf0b6c201f0d80be1ff968f8ba2484585d2d9182cb9baa3ebd3bac869860183` |
| `inter-v4.1-latin-ext-variable-italic.woff2` | 157088 | `a74f5931e84e245f00e02e0010085706b4e9e6acd048932350bfcecfeb6110ef` |
| `inter-v4.1-latin-static-regular.woff2`      |  30500 | `1026c48f5b1eb4979f3f9e802f58b74fa3d3a7cbaf779cfffc47bb145d740188` |
| `inter-v4.1-latin-ext-static-regular.woff2`  |  35480 | `339329e0c580a9a660b761a2418a87df4abed573126923c471e03edf36c583fb` |
| `inter-v4.1-latin-static-bold.woff2`         |  31416 | `39e54e048d7e6fd175f80b941b174c445b4b130bdcc78dc993307383f91c0a31` |
| `inter-v4.1-latin-ext-static-bold.woff2`     |  36424 | `ef8262fb43b762c380ecd732b1922da54d783dabf69d6cdc5a4a80b8487e9505` |

Regenerate with FontTools `4.63.0`, Brotli `1.2.0`, the Unicode ranges recorded in
`src/styles/fonts.css`, and these options:

```text
--flavor=woff2 --layout-features='*' --name-IDs='*' --name-legacy
--name-languages='*' --notdef-glyph --recommended-glyphs
```

The variable faces serve the document. The static 400/700 faces are loaded only by the legacy-
compatible Highcharts runtime, whose inline typography explicitly selects `Inter`. After
regeneration, update the hashes above and the locked frontend-system contract test. The
upstream `v4.1` license is reproduced byte-for-byte in `LICENSE.txt` (SHA-256
`262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a`).
