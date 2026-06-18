---
title: "Distributed Store: Log Compaction & Snapshots"
date: "2026-06-15"
description: "Implementing data serializations and streaming index logs to slow nodes."
tags: ["Achievements/Experience", "Raft Consensus", "Docker"]
readTime: "6 min read"
---

Raft databases prune logs periodically to manage disk usage.

We write snapshot functions and handle state transfers to slow nodes.

This restores node states quickly after crash simulations.
