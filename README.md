# BrainBank

BrainBank is a private, mobile-first study notes platform built with React,
Express, and MongoDB.

## Supabase Storage setup

1. Create a project in [Supabase](https://supabase.com/).
2. In **Storage**, create a **private** bucket named `notes-files`. Do not make
   the bucket public.
3. Open the project's API settings and copy the **Project URL** and
   **service_role** key.
4. Add the values to `server/.env`:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_BUCKET=notes-files
   ```

   The service-role key is a secret. Keep it on the server only; never add it
   to client environment variables, source control, or browser code.
5. Install server dependencies and start the API:

   ```sh
   cd server
   npm install
   npm run dev
   ```

The API uses the private bucket to store PDF and DOCX originals. Authenticated
note requests receive short-lived signed URLs that expire after 10 minutes.
Markdown content remains stored in the database. Existing notes with a
`fileKey` need a matching object path in this bucket for their original file to
be available.

Supabase free projects may pause after 7 days of inactivity. Resume a paused
project from the Supabase dashboard; storage requests will remain unavailable
until the project is active again.

Storage-provider-specific code is isolated in
[`server/src/services/storage.js`](./server/src/services/storage.js). If the
storage provider changes in the future, that is the only provider adapter file
to edit.
