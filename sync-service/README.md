# Vector Store Sync Service

Automaattinen palvelu, joka synkronoi SharePoint-kansion tiedostot OpenAI Vector Storeen.

## Ominaisuudet

- ✅ Automaattinen synkronointi määritetyin väliajoin (cron)
- ✅ Lataa uudet tiedostot SharePointista
- ✅ Poistaa tiedostot jotka on poistettu SharePointista
- ✅ Tukee useita tiedostomuotoja (.pdf, .docx, .txt, .md)
- ✅ Tiedostokoon rajoitus
- ✅ Azure AD autentikointi

## Asennus

1. **Luo Azure AD App Registration:**

   - Mene Azure Portaliin → Azure Active Directory → App registrations
   - Luo uusi app registration
   - API permissions → Add permission → Microsoft Graph → Application permissions
   - Lisää: `Files.Read.All`, `Sites.Read.All`
   - Grant admin consent

2. **Kopioi .env tiedosto:**

   ```bash
   cp .env.example .env
   ```

3. **Täytä .env tiedostoon:**

   - `OPENAI_API_KEY`: OpenAI API-avain
   - `VECTOR_STORE_ID`: Vector store ID (vs_xxx)
   - `AZURE_TENANT_ID`: Azure tenant ID
   - `AZURE_CLIENT_ID`: Azure app client ID
   - `AZURE_CLIENT_SECRET`: Azure app client secret
   - `SHAREPOINT_SITE_ID`: SharePoint site ID
   - `SHAREPOINT_FOLDER_PATH`: Polku kansioon (esim. `/Shared Documents/AI`)

4. **Asenna riippuvuudet:**
   ```bash
   npm install
   ```

## Käyttö

### Kertaluontoinen synkronointi:

```bash
npm run sync
```

### Automaattinen synkronointi (daemon):

```bash
npm start
```

Tai development-tilassa:

```bash
npm run dev
```

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

## SharePoint Site ID löytäminen

```powershell
# PowerShellillä Microsoft Graph:
Connect-MgGraph -Scopes "Sites.Read.All"
Get-MgSite -Search "YourSiteName"
```

Tai käytä Graph Explorer: https://developer.microsoft.com/graph/graph-explorer

```
GET https://graph.microsoft.com/v1.0/sites?search=YourSiteName
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

### "Invalid credentials":

- Tarkista Azure AD app permissions
- Varmista että admin consent on annettu

### "File not found":

- Tarkista `SHAREPOINT_FOLDER_PATH`
- Varmista että app:lla on oikeudet kansioon

### "Rate limit exceeded":

- Vähennä synkronointitaajuutta
- Tarkista OpenAI API quota
