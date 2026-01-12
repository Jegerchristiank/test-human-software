# Auth Flow Checklist

Status: manual verification required (needs live Supabase project + credentials).

- [ ] Opret med gyldige data (forvent: konto oprettes, evt. email-bekraeftelse vises).
- [ ] Opret med eksisterende email (forvent: tydelig fejlbesked om eksisterende konto).
- [ ] Login med forkert adgangskode (forvent: "Forkert email eller adgangskode").
- [ ] Login med korrekt adgangskode (forvent: redirect til app + session aktiv).
- [ ] Logout (forvent: session nulstillet og tilbage til auth/landing).
- [ ] Hard refresh mens logged in (forvent: session persist + ingen forkert redirect).
- [ ] Hard refresh mens logged out (forvent: auth screen + ingen session).
- [ ] Direkte navigation til protected route mens logged out (forvent: redirect til sign-in med returnUrl).
- [ ] Direkte navigation til protected route mens logged in (forvent: adgang tilladt).
- [ ] ReturnUrl fungerer korrekt og sikkert (kun samme origin, ingen auth-loop).
- [ ] Fejl vises konsistent og UX-venligt (Supabase errors map'et til brugerbeskeder).
