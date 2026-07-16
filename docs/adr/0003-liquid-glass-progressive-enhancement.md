# ADR 0003: Progressive liquid-glass surfaces

Status: Accepted

Liquid glass is a bounded shared surface system: translucent base, constrained backdrop treatment where supported, pointer-driven CSS-variable specular highlight, edge reflection, subtle noise cue, and internal depth. It must retain an opaque high-contrast fallback.

No full-screen or nested backdrop-filter layers are permitted. Fine-pointer motion is disabled for coarse pointers and reduced-motion users. Contrast, focus, and paint/composite cost are release gates.
