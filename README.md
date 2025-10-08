# Zweefhulp

Een AI-aangedreven zoektool om verkiezingsprogramma's van de Tweede Kamerverkiezingen 2025 semantisch te doorzoeken en vergelijken.

## Functies

- 🔍 **Semantisch zoeken** - Vind relevante standpunten op basis van betekenis, niet alleen exacte zoektermen
- 📊 **Visuele vergelijking** - Zie in één oogopslag welke partijen het meeste schrijven over jouw onderwerp
- 💬 **Directe citaten** - Lees de exacte tekst uit de verkiezingsprogramma's met paginanummers
- 🎯 **Gestructureerde resultaten** - Standpunten worden samengevat met ondersteunende citaten

## Technologie

- **Next.js 15** met React 19 en TypeScript
- **PostgreSQL** met pgvector voor semantisch zoeken
- **Prisma ORM** voor database beheer
- **OpenAI embeddings** via LangChain voor AI-zoekfunctionaliteit
- **Tailwind CSS** voor moderne styling
- **pnpm** als package manager

## Quick Start

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

# Setup database
pnpm prisma migrate deploy
pnpm prisma db seed

# Start development server
pnpm dev
```

Navigeer naar [http://localhost:3000](http://localhost:3000)

## Database

Het project gebruikt PostgreSQL met de pgvector extensie voor vector embeddings. De database schema bevat:

- **Party** - Politieke partijen met metadata
- **Program** - Verkiezingsprogramma's (PDFs)
- **Document** - Geparseerde pagina's met vector embeddings
- **SearchResult** - Gecachte zoekresultaten
- **Position** - Standpunten per partij
- **Quote** - Citaten uit programma's

## Scripts

```bash
pnpm dev      # Start development server met Turbopack
pnpm build    # Build voor productie
pnpm start    # Start productie server
pnpm lint     # Check code met Biome
pnpm format   # Format code met Biome
```

## Structuur

```
app/
├── prisma/           # Database schema en migraties
├── programs/         # PDF verkiezingsprogramma's
├── src/
│   ├── app/          # Next.js App Router
│   │   ├── api/      # API routes
│   │   ├── search/   # Zoekpagina
│   │   └── page.tsx  # Homepage
│   └── lib/          # Utilities
└── public/           # Statische assets
```

## Over dit project

Zweefhulp helpt kiezers objectief en transparant te vergelijken wat verschillende politieke partijen zeggen over specifieke onderwerpen. Het project is volledig open source en maakt gebruik van publiek beschikbare verkiezingsprogramma's.

## Credits

Een initiatief van:
- [Robert Gaal](https://gaal.co)
- [Stefan Borsje](https://stefanborsje.com/)

## Contact

[robert@gaal.co](mailto:robert@gaal.co)

## Licentie

MIT License - zie [LICENSE](LICENSE) voor details

