# ADR 0002: Typed chapter registry and selector stores

Status: Accepted

A single serializable typed chapter registry will define chapter ids, section order, content keys, camera poses, atmosphere, exhibit policy, navigation, and responsive overrides. Continuous scroll and pointer values remain outside broad React context; discrete narrative and scene state use selector-based stores.

This replaces duplicate section/chapter systems, mutable Three.js configuration values, percentage bands, and competing camera rigs. Migration removes legacy paths only after registry completeness and navigation tests pass.
