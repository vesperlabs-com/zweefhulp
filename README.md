# Zweefhulp

Een AI-aangedreven zoektool om verkiezingsprogramma's van de Tweede Kamerverkiezingen 2025 semantisch te doorzoeken en vergelijken.

*An AI-powered search tool to semantically search and compare Dutch election programs for the 2025 parliamentary elections.*

## Functies

- **Semantisch zoeken** - Vind relevante standpunten op basis van betekenis, niet alleen exacte zoektermen
- **Visuele vergelijking** - Zie in één oogopslag welke partijen het meeste schrijven over jouw onderwerp
- **Directe citaten** - Lees de exacte tekst uit de verkiezingsprogramma's met paginanummers

## Technologie

- **Next.js 15** met React 19 en TypeScript
- **PostgreSQL** met pgvector voor semantisch zoeken
- **Prisma ORM** voor database beheer
- **OpenAI GPT-5** voor standpunt analyse via LLM
- **OpenAI embeddings** voor semantisch zoeken
- **Tailwind CSS** voor moderne styling
- **pnpm** als package manager

## Data

### Database

Het project gebruikt PostgreSQL met de pgvector extensie voor vector embeddings. De database schema bevat:

- **Party** - Politieke partijen met metadata
- **Program** - Verkiezingsprogramma's (PDFs)
- **Document** - Geparseerde pagina's met vector embeddings
- **SearchResult** - Gecachte zoekresultaten
- **Position** - Standpunten per partij
- **Quote** - Citaten uit programma's

### Verkiezingsprogramma's

Alle verkiezingsprogramma's zijn gedownload op **6 oktober 2025** van de officiële websites van de politieke partijen. Ze zijn niet aangepast en opgeslagen in de [`app/public/programs/`](app/public/programs/) directory.

### Seeding

Het seeding proces ([`app/prisma/seed.ts`](app/prisma/seed.ts)) verwerkt alle PDF's en maakt de database doorzoekbaar:

1. **Party records** aanmaken voor elke politieke partij
2. **Program records** aanmaken die PDFs koppelen aan partijen
3. **PDF verwerking** per programma:
   - Laden met LangChain's PDFLoader
   - Opsplitsen in chunks (~1000 karakters, 200 overlap)
   - Embeddings genereren via OpenAI `text-embedding-3-small`
   - Opslaan in Document tabel met pgvector

**Kosten**: ~€0.10-0.40 voor alle 18 programma's (±$0.02 per 1M tokens)

## AI

Zweefhulp gebruikt AI op drie manieren om verkiezingsprogramma's doorzoekbaar te maken:

### 1. Document Embeddings (Seeding)

Tijdens het seeden van de database worden alle PDF's verwerkt:

- **Locatie**: [`app/prisma/seed.ts`](app/prisma/seed.ts) (regel ~54-60, 117-120)
- **Model**: OpenAI `text-embedding-3-small`
- **Proces**: Elk document wordt opgesplitst in chunks van ~1000 karakters en omgezet naar vector embeddings die worden opgeslagen in PostgreSQL met pgvector

### 2. Semantisch Zoeken (Vector Similarity)

Bij elke zoekopdracht wordt de query omgezet naar een vector embedding en vergeleken met document embeddings:

- **Locatie**: [`app/src/app/api/search/route.ts`](app/src/app/api/search/route.ts) (regel ~286-289, 75-90)
- **Model**: OpenAI `text-embedding-3-small`
- **Proces**: De top 50 meest relevante chunks per partij worden opgehaald via cosine similarity search

### 3. Standpunt Analyse (LLM)

De gevonden chunks worden geanalyseerd door een LLM om gestructureerde standpunten te genereren:

- **Locatie**: [`app/src/app/api/search/route.ts`](app/src/app/api/search/route.ts) (regel ~108-185, 188-192)
- **Model**: OpenAI `gpt-4.1`
- **Prompt**: De gedetailleerde instructies voor het analyseren staan op regel ~108
- **Proces**: Het model selecteert relevante citaten, identificeert standpunten en structureert ze met titel, ondertitel en verbatim quotes

## Setup

### Vereisten

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+ met pgvector extensie
- OpenAI API key

### Installatie

```bash
# Clone de repository
git clone https://github.com/vesperlabs-com/zweefhulp.git
cd zweefhulp/app

# Installeer dependencies
pnpm install

# Setup environment variabelen
cp .env.example .env
# Voeg je DATABASE_URL en OPENAI_API_KEY toe aan .env

# Setup database en seed met verkiezingsprogramma's
pnpm prisma migrate deploy
pnpm prisma db seed  # Verwerkt alle PDFs (~10-30 min)

# Start development server
pnpm dev
```

Navigeer naar [http://localhost:3000](http://localhost:3000)

**Troubleshooting**:
- **OPENAI_API_KEY niet gevonden**: Check je `.env` bestand
- **vector type bestaat niet**: Zorg dat pgvector extensie is ingeschakeld in je database
- **Memory errors bij seeding**: Programma's worden al sequentieel verwerkt, maar je kunt ze handmatig in batches doen door `seed.ts` aan te passen

### Scripts

```bash
pnpm dev      # Start development server met Turbopack
pnpm build    # Build voor productie
pnpm start    # Start productie server
pnpm lint     # Check code met Biome
pnpm format   # Format code met Biome
```

## Credits

Een initiatief van [Vesper Labs](https://vesperlabs.com):

- [Robert Gaal](https://gaal.co)
- [Stefan Borsje](https://stefanborsje.com/)

## Contact

[info@zweefhulp.nl](mailto:info@zweefhulp.nl)

## Licentie

MIT License - zie [LICENSE](LICENSE) voor details

