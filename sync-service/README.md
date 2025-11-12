# Vector Store Sync Service

Automaattinen palvelu, joka synkronoi Google Drive -kansion tiedostot OpenAI Vector Storeen.

## Ominaisuudet

- ✅ Automaattinen synkronointi määritetyin väliajoin (cron)
- ✅ Lataa uudet tiedostot Google Drivesta
- ✅ Poistaa tiedostot jotka on poistettu Google Drivesta
- ✅ Tukee useita tiedostomuotoja (.pdf, .docx, .txt, .md)
- ✅ Tiedostokoon rajoitus (512 MB per tiedosto)
- ✅ Google Service Account autentikointi (ei OAuth!)
- ✅ Ei vaadi Azure AD tai Microsoft 365 -lisenssejä

## Asennus

### 1. Luo Google Cloud Project ja Service Account

1. **Mene Google Cloud Consoleen:** https://console.cloud.google.com
2. **Luo uusi projekti** (tai käytä olemassaolevaa)
3. **Aktivoi Google Drive API:**
   - APIs & Services → Enable APIs and Services
   - Etsi "Google Drive API" ja aktivoi
4. **Luo Service Account:**
   - IAM & Admin → Service Accounts → Create Service Account
   - Anna nimi (esim. "va-ai-sync")
   - Luo ja lataa JSON-avain
5. **Kopioi Service Account email** (esim. `va-ai-sync@project-id.iam.gserviceaccount.com`)

### 2. Luo Google Drive -kansio

1. Mene Google Driveen: https://drive.google.com
2. Luo uusi kansio AI-tiedostoille
3. **Jaa kansio Service Account:lle:**
   - Kansion Share → Lisää Service Account email
   - Anna "Viewer" tai "Editor" -oikeudet
4. **Kopioi kansion ID** URL:sta:
   - `https://drive.google.com/drive/folders/KANSIO_ID_TÄSSÄ`

### 3. Konfiguroi environment

1. **Kopioi .env-template:**

   ```bash
   cp .env.googledrive-example .env
   ```

2. **Täytä .env tiedostoon:**

   - `OPENAI_API_KEY`: OpenAI API-avain
   - `VECTOR_STORE_ID`: Vector store ID (vs_xxx)
   - `GOOGLE_DRIVE_FOLDER_ID`: Google Drive kansion ID
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service Account email
   - `GOOGLE_PRIVATE_KEY`: Service Account private key (JSON-tiedostosta)
   - `GOOGLE_PROJECT_ID`: Google Cloud project ID

3. **Asenna riippuvuudet:**
   ```bash
   npm install
   ```

## Käyttö

### Kertaluontoinen synkronointi:

```bash
npm run sync:googledrive
```

### Automaattinen synkronointi (daemon):

```bash
npm start
```

Tai development-tilassa:

```bash
npm run dev
```

### Mitä synkronoinnissa tapahtuu:

1. ✅ Yhdistetään Google Driveen Service Account:lla
2. ✅ Haetaan kaikki tiedostot määritetystä kansiosta
3. ✅ Haetaan Vector Store:n nykyiset tiedostot
4. ✅ Verrataan tiedostoja:
   - Uudet tiedostot → Ladataan ja lähetetään Vector Storeen
   - Poistetut tiedostot → Poistetaan Vector Storesta
   - Muuttamattomat → Ei toimintoja
5. ✅ Tulostetaan synkronoinnin yhteenveto

### Cron-aikataulu:

Muokkaa `.env` tiedostossa `SYNC_SCHEDULE` arvoa (cron format):

```bash
# Joka 6. tunti
SYNC_SCHEDULE=0 */6 * * *

# Joka päivä klo 02:00
SYNC_SCHEDULE=0 2 * * *

# Joka tunti
SYNC_SCHEDULE=0 * * * *
```

## Tuotantokäyttö

### PM2:lla (suositus):

```bash
# Asenna PM2
npm install -g pm2

# Käynnistä service
pm2 start npm --name "vector-sync" -- start

# Automaattinen käynnistys bootatessa
pm2 startup
pm2 save
```

### Docker:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Seuranta

Lokitiedot näkyvät konsolissa. PM2:lla:

```bash
pm2 logs vector-sync
```

## Vianmääritys

### "Invalid credentials" / "Authentication failed":

- Tarkista että Service Account JSON-avain on oikein
- Varmista että `GOOGLE_PRIVATE_KEY` sisältää koko private keyn (mukaan lukien `-----BEGIN PRIVATE KEY-----`)
- Testaa Service Account: `npm run sync:googledrive`

### "Folder not found" / "No files found":

- Tarkista `GOOGLE_DRIVE_FOLDER_ID` (URL:sta kansion ID)
- Varmista että olet jakanut kansion Service Account emailille
- Tarkista että Service Account:lla on vähintään "Viewer" -oikeudet

### "Vector Store API not available":

- Varmista että käytät OpenAI SDK v6.8.1 tai uudempaa
- Tarkista että `VECTOR_STORE_ID` on oikein
- Testaa Vector Store API: `npm run sync:googledrive`

### "Rate limit exceeded":

### Synkronointi ei löydä tiedostoja:

- Tarkista tiedostomuoto (tuetut: .pdf, .docx, .txt, .md)
- Varmista että tiedostot eivät ole roskakorissa
- Tarkista tiedostokoko (max 512 MB)
