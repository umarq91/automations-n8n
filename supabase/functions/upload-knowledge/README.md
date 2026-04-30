# upload-knowledge — Edge Function

Uploads a document (PDF or plain text) into Pinecone as searchable vector embeddings, scoped to an organization and knowledge domain.

---

## Why This Exists

The AI that generates product listings needs to follow organization-specific rules — SEO guidelines, banned words, tone preferences. These documents can be long (many pages). Stuffing them raw into every prompt is:

- Too expensive (tokens cost money)
- Often impossible (context window limits)
- Wasteful (most of the document is irrelevant to any single generation)

The solution is **Retrieval-Augmented Generation (RAG)**:

1. Pre-process the document into small chunks
2. Convert each chunk into a vector (numbers that encode meaning)
3. Store vectors in a vector database (Pinecone)
4. At generation time, query only the relevant chunks and inject them into the prompt

---

## Why OpenAI Embeddings

Text is human-readable. Similarity search requires numbers.

An **embedding model** converts a piece of text into an array of floats (a vector) where similar meaning = similar numbers = close distance in vector space.

```
"Use target keyword in first sentence"  →  [0.23, -0.41, 0.87, ...]  (1024 floats)
"Place primary keyword near the top"    →  [0.21, -0.38, 0.90, ...]  ← very close
"Avoid passive voice"                   →  [0.91,  0.12, -0.33, ...]  ← far away
```

This function uses **`text-embedding-3-small`** from OpenAI with `dimensions: 1024`.

> The `dimensions` param uses OpenAI's native MRL truncation — no quality loss vs. manually slicing a 1536-dim vector. Must match the Pinecone index dimension exactly.

---

## Why Pinecone

Pinecone is a **vector database** — purpose-built to store millions of vectors and find the nearest matches in milliseconds.

A standard SQL/Postgres database cannot efficiently run nearest-neighbor search across thousands of high-dimensional float arrays. Pinecone handles this with ANN (Approximate Nearest Neighbor) indexing.

Each organization's knowledge is stored in an isolated **namespace**:

```
{org_id}-seo           ← SEO guidelines
{org_id}-banned_words  ← Banned words / phrases
```

Namespaces allow one Pinecone index to serve all organizations without cross-contamination.

---

## End-to-End Flow

### Upload time (this function)

```
User uploads file (PDF or .txt/.md)
          ↓
Edge Function validates JWT → extracts user_id
          ↓
Checks org membership: must be owner or admin
          ↓
Extracts raw text from file:
  - PDF  → parses BT...ET blocks from raw bytes (no lib dependency)
  - Text → reads directly
          ↓
Splits text into overlapping chunks (~800 chars, 80-char overlap)
  - Paragraph-aware: tries to split on double newlines first
  - Falls back to sentence splitting for oversized paragraphs
          ↓
Sends all chunks to OpenAI Embeddings API in one batch
  → receives 1024-dim float vector per chunk
          ↓
Deletes existing Pinecone namespace for this org+domain
  (full replacement on each upload — no stale chunks)
          ↓
Upserts new vectors to Pinecone in batches of 100
  Each vector carries metadata: { text, domain, org_id }
          ↓
Returns: { ok, namespace, vector_id, chunk_count }
          ↓
Frontend stores namespace + vector_id in ai_config table
```

### Query time (at AI generation — not in this function)

```
User triggers product content generation
          ↓
Generation function embeds the query (e.g. product category/title)
          ↓
Pinecone similarity search in namespace "{org_id}-seo"
          ↓
Top N most relevant chunks returned (with their raw text)
          ↓
Chunks injected into the AI prompt as context
          ↓
AI generates content following organization-specific rules
```

---

## Request Format

`POST /functions/v1/upload-knowledge`

**Headers:**
```
Authorization: Bearer <supabase_jwt>
Content-Type: multipart/form-data
```

**Body (form-data):**

| Field    | Type   | Required | Description                                      |
|----------|--------|----------|--------------------------------------------------|
| `file`   | File   | Yes      | `.pdf`, `.txt`, or `.md`                         |
| `domain` | string | Yes      | One of: `seo`, `banned_words`, `general`         |
| `org_id` | string | Yes      | Organization UUID                                |

---

## Response

**Success (`200`):**
```json
{
  "ok": true,
  "namespace": "org_uuid-seo",
  "vector_id": "batch-uuid",
  "chunk_count": 42
}
```

**Failure:**
```json
{
  "ok": false,
  "message": "Only owners and admins can upload knowledge files"
}
```

---

## Required Environment Variables

| Variable                  | Description                          |
|---------------------------|--------------------------------------|
| `OPENAI_API_KEY`          | OpenAI secret key                    |
| `PINECONE_API_KEY`        | Pinecone API key                     |
| `PINECONE_HOST`           | Pinecone index host URL              |
| `SUPABASE_URL`            | Set automatically by Supabase        |
| `SUPABASE_SERVICE_ROLE_KEY` | Set automatically by Supabase      |

> `PINECONE_HOST` is the full host for your specific index, e.g. `https://my-index-xxxx.svc.pinecone.io`

---

## Important: Pinecone Index Dimension

The Pinecone index **must be created with `dimensions: 1024`**.

This function requests `dimensions: 1024` from OpenAI. If your index was created with a different dimension (e.g. 1536), upserts will fail with:

```
Vector dimension 1536 does not match the dimension of the index 1024
```

Fix: either recreate the index at 1024, or change the `dimensions` param in this function to match your index.

---

## Database Columns (ai_config table)

After a successful upload the frontend writes to:

| Column                            | Stores                          |
|-----------------------------------|---------------------------------|
| `seo_vector_namespace`            | Pinecone namespace for SEO docs |
| `seo_vector_id`                   | Batch UUID of last SEO upload   |
| `bannable_words_vector_namespace` | Pinecone namespace for banned words |
| `bannable_words_vector_id`        | Batch UUID of last banned words upload |
