DLSJBC Student Portal (polished v2)
===================================
Run locally: open index.html in a browser. No install needed.
Publish: upload the whole folder (index.html, css/, js/, images/) to any static web host.

Saved progress
- While a student fills in the registration form, their answers are saved in their own browser
  (localStorage). If they refresh, close the tab or restart the browser, the form comes back
  with a "Start over" option.
- Passwords and the privacy-policy tick are never saved.
- A saved draft expires after 3 days (change DRAFT_DAYS in js/script.js) and is deleted
  once registration succeeds.
- It is stored per device and browser, so it will not follow the student to another computer.

Contact details (js/script.js, CONTACT block)
- Taken from the official site, dlsjbc.edu.ph/contact. The site lists no phone number or
  office hours, so none are shown. Add them to CONTACT if the Registrar provides them.

Student number and mobile number
- Not a fixed format. Student number: 3 to 20 letters, numbers or dashes, kept exactly as typed.
- Mobile number: any number with 7 to 15 digits; + , spaces, dashes and brackets are allowed.

Demo data (nothing is sent to a server)
- Test login: student number 2026-00001, password Animo2026.
- Gmail and Facebook buttons are simulated.
- Registration, password reset and the email form do not store or send anything yet. A real
  site needs a back end for those.
