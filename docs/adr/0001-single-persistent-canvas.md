# ADR 0001: One persistent WebGL canvas

Status: Superseded by ADR 0011 (DOM-only architecture)

> Superseded on 2026-10-18. The single persistent canvas is gone: the stage is
> DOM, the only WebGL surface is the lazily imported lanyard island, and the
> journey is a scalar sampled by one shared scheduler. See ADR 0011 for the
> decision and its consequences, and ADR 0010 for the exhibit medium that
> made the inversion possible. This record is kept for provenance.

The portfolio will maintain one fixed React Three Fiber Canvas behind semantic DOM sections. Sections may request chapter state but never create their own Canvas or WebGL renderer.

This preserves GPU context, makes camera and atmosphere transitions coherent, avoids duplicate renderer lifecycle bugs, and permits a complete DOM fallback when WebGL is unavailable. `page.tsx` will own the fixed scene shell; section content remains normal document flow.
