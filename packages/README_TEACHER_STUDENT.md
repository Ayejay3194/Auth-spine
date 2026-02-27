# Teacher–Student + Oracle Architecture

This project ships **one Truth Core** and two deployable "faces":

- **Truth Teacher (offline)**: heavy model, long context, trains on datasets.
- **Truth Student (runtime)**: distilled lightweight model for fast inference.
- **Oracle Teacher (offline)**: style generator trained ONLY on structured truth outputs.
- **Oracle Student (runtime)**: cheap renderer that mimics style but cannot invent facts.

Key rule: **Truth is data. Oracle is narration.**
The oracle never computes physics, never touches raw ephemeris, never creates new claims.
