# FIXA FILE STORE — GitHub Pages + Supabase

இந்த Project-ல் தங்க நிற circular loading screen, Login/Register, Private Cloud Storage, ZIP/APK உட்பட பல file types Upload, Search, Download, Delete வசதிகள் உள்ளன.

## இதில் என்ன இருக்கிறது?

- `public/index.html` — Website layout
- `public/style.css` — Mobile-friendly dark/gold design
- `public/app.js` — Supabase Auth மற்றும் Storage இணைப்பு
- `supabase/setup.sql` — Database table, private bucket, RLS policies
- GitHub Pages மூலம் static website hosting

**முக்கியம்:** இது deploy-ready starter project. கீழே உள்ள Supabase setup செய்து, SQL இயக்கி, GitHub Pages-ல் publish செய்த பிறகே முழுமையாக வேலை செய்யும்.

---

## படி 1 — Supabase Project உருவாக்கவும்

1. https://supabase.com/dashboard திறக்கவும்.
2. புதிய Project உருவாக்கவும்.
3. Database password-ஐ பாதுகாப்பாக வைத்துக்கொள்ளவும்.
4. Project உருவான பிறகு Project URL மற்றும் Publishable key-ஐ எடுக்கவும். பழைய Project-களில் `anon` public key-யும் பயன்படுத்தலாம்.
5. **`service_role` அல்லது `secret` key-ஐ Website-ல் ஒருபோதும் உள்ளிட வேண்டாம்.**

## படி 2 — Database மற்றும் Storage Security அமைக்கவும்

1. Supabase Dashboard → **SQL Editor** திறக்கவும்.
2. இந்த ZIP-ல் உள்ள `supabase/setup.sql` கோப்பைத் திறந்து முழுவதையும் copy செய்யவும்.
3. SQL Editor-ல் paste செய்து **Run** அழுத்தவும்.
4. SQL வெற்றிகரமாக முடிந்ததா என உறுதி செய்யவும்.

இது `user_files` table, `fixa-files` என்ற Private Storage bucket, மற்றும் ஒவ்வொரு பயனரும் தங்கள் சொந்த கோப்புகளை மட்டும் அணுகும் RLS policies உருவாக்கும்.

## படி 3 — Google / Gmail Login அமைக்கவும்

1. Supabase Dashboard → **Authentication → Providers → Email** செல்லவும்.
2. Email provider enable செய்யப்பட்டுள்ளதா பாருங்கள்.
3. விரும்பினால் Email confirmation-ஐ வைத்திருக்கலாம். அது ON என்றால் Register செய்த பிறகு Email உறுதிப்படுத்த வேண்டியிருக்கும்.
4. Authentication → URL Configuration பகுதியில் உள்ள Site URL-ஐ உங்கள் GitHub Pages URL-க்கு அமைக்கவும். உதாரணம்: `https://YOUR-USERNAME.github.io/fixa-file-store/`.
5. Redirect URLs-ல் அந்த URL-ஐயும் சேர்க்கவும்.

இந்த பதிப்பில் **Google OAuth Login** பயன்படுத்தப்படுகிறது. பயனர் முதன்முறையாக Google மூலம் வரும்போது Supabase Auth கணக்கை உருவாக்கும்; பின்னர் அதே Google கணக்கில் உள்நுழையலாம். Email + Password form இல்லை.

## படி 4 — GitHub-ல் Upload செய்யவும்

1. https://github.com/ திறந்து Login செய்யவும்.
2. `fixa-file-store` என்ற புதிய repository உருவாக்கவும்.
3. இந்த ZIP-ஐ extract செய்யவும்.
4. `public` folder-இன் உள்ளடக்கங்களை repository root-க்கு upload செய்யவும். Repository root-ல் `index.html`, `style.css`, `app.js` இருக்க வேண்டும்.
5. `supabase/setup.sql` மற்றும் `README_TAMIL.md` கோப்புகளையும் சேர்க்கலாம்.

**கவனம்:** `public` folder-ஐ அப்படியே root-க்கு upload செய்தால் GitHub Pages source directory-யை `/public` என அமைக்க வேண்டும். எளிதான வழி `public`-இன் உள்ளடக்கங்களை root-க்கு நகர்த்துவது.

## படி 5 — GitHub Pages Enable செய்யவும்

1. Repository → **Settings → Pages** செல்லவும்.
2. **Deploy from a branch** தேர்வு செய்யவும்.
3. Branch: `main`; folder: `/(root)` தேர்வு செய்து Save செய்யவும்.
4. சில நிமிடங்களில் GitHub Pages URL கிடைக்கும்.

GitHub Pages static hosting மட்டுமே. Supabase Auth மற்றும் Storage தான் account, database மற்றும் file storage-ஐ வழங்கும்.

## படி 6 — Website-ஐ Supabase-உடன் இணைக்கவும்

1. உங்கள் GitHub Pages URL-ஐத் திறக்கவும்.
2. முதலில் வரும் Supabase Setup திரையில் Project URL மற்றும் Publishable key / anon public key உள்ளிடவும்.
3. **இரகசிய `service_role` / `secret` key-ஐ இட வேண்டாம்.**
4. Continue செய்து Register tab-ல் Email மற்றும் குறைந்தது 8 எழுத்துகள் கொண்ட Password உருவாக்கவும்.
5. Email confirmation ON இருந்தால் Email-ஐ உறுதிப்படுத்தி Login செய்யவும்.
6. ZIP/APK போன்ற கோப்பை Upload செய்து, Search, Download, Delete ஆகியவற்றைச் சோதிக்கவும்.

Project URL மற்றும் public key அந்த Browser-ன் local storage-ல் சேமிக்கப்படும். வேறு சாதனத்தில் முதல் முறை திறக்கும்போது மீண்டும் உள்ளிட வேண்டும். இவை public client configuration; தனிப்பட்ட பாதுகாப்பு RLS policies மூலம் அமல்படுத்தப்படுகிறது.

---

## File storage மற்றும் account isolation

- ஒவ்வொரு file object-க்கும் `auth.uid()` அடிப்படையில் folder உருவாகும்.
- Storage bucket `fixa-files` Private ஆக இருக்கும்.
- Database மற்றும் Storage policies இரண்டும் பயனர் தன் UID-க்கு சொந்தமான கோப்புகளை மட்டுமே அணுக அனுமதிக்கும்.
- Download-க்கு 60 விநாடி காலாவதியாகும் signed URL உருவாக்கப்படும்.
- கோப்பு அளவு அதிகபட்சம் 100 MiB; அனுமதிக்கப்பட்ட extension பட்டியல் `public/app.js`-ல் உள்ளது.
- ZIP/APK கோப்புகள் storage-ல் வைக்கப்படும்; இந்த website அவற்றை install செய்யாது.

## பாதுகாப்பு மற்றும் பராமரிப்பு

- `service_role` / secret key frontend-ல் சேர்க்க வேண்டாம்.
- Public repository-ல் password, database secret, private key போன்றவை commit செய்ய வேண்டாம்.
- Production-ல் custom domain/HTTPS, account rate limits, backups, upload quotas மற்றும் Supabase plan limits கவனிக்கவும்.
- Browser-side file extension check வசதி பயன்பாட்டிற்காக மட்டுமே; அது முழுமையான malware scanning அல்ல.
- Delete செயல்பாடு Storage object-ஐயும் metadata-யையும் நீக்கும். எதிர்பாராத network error ஏற்பட்டால் Dashboard-ல் orphaned objects-ஐ பரிசோதிக்கவும்.
- இந்த Project-ல் account authentication-க்கு Supabase Auth பயன்படுத்தப்படுகிறது; Password-களை இந்த website தனியாகச் சேமிப்பதில்லை.

## Troubleshooting

- **Invalid API key:** Project URL மற்றும் Publishable/anon public key சரியானதா பார்க்கவும்.
- **Upload denied / RLS error:** `supabase/setup.sql` முழுவதையும் சரியான Project-ல் Run செய்துள்ளீர்களா உறுதி செய்யவும்.
- **Email confirmation:** Register செய்த பிறகு Email-ஐ உறுதிப்படுத்தவும் அல்லது Supabase Auth settings-ஐச் சரிபார்க்கவும்.
- **Pages 404:** `index.html` தேர்ந்தெடுத்த Pages root folder-ல் இருக்கிறதா பாருங்கள்.
- **Browser module error:** GitHub Pages HTTPS URL-ல் திறக்கவும்; `file://` மூலம் HTML-ஐ நேரடியாகத் திறக்க வேண்டாம்.
- **Large upload fails:** Supabase project storage limits மற்றும் plan quota-ஐப் பாருங்கள்.

இந்த கோப்புகளை deploy செய்த பிறகும், உண்மையான பயனர் கணக்கு உருவாக்கி, வேறு கணக்கிலிருந்து கோப்புகளைப் பார்க்க முடியாததைச் சோதித்து முடித்த பின்னரே பொதுமக்களுக்குப் பகிரவும்.

## Google Login Setup
See the Supabase Auth Google provider and Google Cloud OAuth setup instructions before use.
