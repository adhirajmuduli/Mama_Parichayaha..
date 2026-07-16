# Asset Inventory Baseline

Captured: 2026-07-16

## Scope and method

The historical CSV and hash files in `docs/assets/` retain the complete pre-disposition inventory captured on 2026-07-15. This document is the deployment baseline after Phase 0 disposition. Each retained GLB was SHA-256 hashed and inspected from its GLB JSON chunk. Triangle counts are the sum of triangle-mode primitive accessor counts divided by three.

| Asset | Bytes | SHA-256 | Generator | Meshes | Triangles | Animation clips | Deployment disposition |
| --- | ---: | --- | --- | ---: | ---: | --- | --- |
| `DNA/dna.glb` | 2,639,156 | `F2A9D7C99748DE8A548605CD066F0768DEB5AC323657519598BD2E3508DFDC24` | Sketchfab 12.66.0 | 2 | 103,840 | `Take 001` | Retained; credited in `docs/assets/model-provenance.md`. |
| `Proteins/GFP.glb` | 5,229,704 | `17041A7A488A0F3B65EC73C82CA1CD75504891F5F3308680E7C0A6200055ADB0` | UCSF ChimeraX 1.11.1 | 1 | 156,024 | none | Retained; locally derived from PDB entry 1GFL. |
| `Tardigrade/water_bear_site.glb` | 21,943,424 | `EC5BE496E12BD34FC5DA233A5EFF352DD060BF27FFC67E03B22F777972E5B23F` | Sketchfab 12.68.0 | 7 | 683,396 | none | Retained; credited in `docs/assets/model-provenance.md`. |

Total retained model payload: 29,812,284 bytes (28.43 MiB).

## Retired binaries

The following pre-disposition binaries were removed on 2026-07-16 and are preserved only in the historical inventory, hashes, and inspection evidence: `Bacteriophage/Phage.glb`, `Earth/earth_animated_site.glb`, `Proteins/AChBp.glb`, `Proteins/apoptosome.glb`, and `Proteins/Proheadt7.glb`. The procedural phage component remains; Earth has no active or dormant model component.

## Version-control configuration

`public/models/**/*.glb` is tracked by Git LFS through `.gitattributes`. Only the three retained binaries are eligible for the reproducible baseline. `public/` is intentionally not ignored.