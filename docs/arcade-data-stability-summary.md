# Arcade Data Stability Summary

Current package:

- race-safe anonymous session creation;
- six-hour `last_seen_at` refresh interval;
- alias preservation during normal reads;
- initial session and alias tests;
- aggregated `/api/arcade/bootstrap` endpoint;
- partial leaderboard failure reporting;
- shared bootstrap response type.

Pending in this branch:

- switch the Lab client to bootstrap loading;
- retain targeted refreshes after alias or score changes;
- add request rate limiting;
- add game-run identifiers and replay protection;
- validate the final branch through CI and Vercel preview.
