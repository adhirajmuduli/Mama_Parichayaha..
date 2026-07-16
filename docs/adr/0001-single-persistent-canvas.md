# ADR 0001: One persistent WebGL canvas

Status: Accepted

The portfolio will maintain one fixed React Three Fiber Canvas behind semantic DOM sections. Sections may request chapter state but never create their own Canvas or WebGL renderer.

This preserves GPU context, makes camera and atmosphere transitions coherent, avoids duplicate renderer lifecycle bugs, and permits a complete DOM fallback when WebGL is unavailable. `page.tsx` will own the fixed scene shell; section content remains normal document flow.