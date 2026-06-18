---
title: "Consensus at the Wire Level: Building Raft"
date: "2026-06-08"
description: "Behind the scenes of writing a 5-node consensus protocol from scratch with leader leases and snapshotting."
tags: ["Distributed Systems", "Raft", "Python", "ZeroMQ"]
readTime: "8 min read"
---

Consensus is the core foundation of high-availability distributed databases like CockroachDB, Etcd, and TiDB. While the theoretical paper on Raft makes it look simple, implementing it in code reveals a massive matrix of corner cases. 

I built a **5-node Raft Consensus Key-Value Store** from scratch using Python and ZeroMQ. Here is what I learned about coding distributed agreements at the wire level.

---

## 1. The Wire Protocol (ZeroMQ)
Rather than abstracting networking away, I chose **ZeroMQ** because of its raw socket capabilities. Each node runs a background event loop listening on `ROUTER/DEALER` sockets to handle concurrent requests. 

The protocol operates on three message types:
1. **RequestVote**: Triggered when a follower times out and becomes a Candidate.
2. **AppendEntries**: Sent by the Leader as a heartbeat and log replication mechanism.
3. **InstallSnapshot**: Sent when a lagging node needs to fetch the database state directly because its log has been compacted.

---

## 2. Managing Election State
Raft nodes transition between three roles: **Follower**, **Candidate**, and **Leader**. 

```text
               Timeout
Follower  ──────────────────>  Candidate
   ▲                              │
   │  Receives Majority Votes     │
   ├──────────────────────────────┘
   │
   │  Discovers Higher Term
   └──────────────────────────────  Leader
```

Here is a snippet of how candidates request votes concurrently using non-blocking ZeroMQ sockets:

```python
# Candidate requests votes from peers
def request_votes(self):
    self.state = "CANDIDATE"
    self.current_term += 1
    self.voted_for = self.self_id
    votes_received = 1 # Vote for self

    req_payload = {
        "term": self.current_term,
        "candidate_id": self.self_id,
        "last_log_index": self.log.last_index(),
        "last_log_term": self.log.last_term()
    }

    for peer_id, socket in self.peer_sockets.items():
        # Async request vote to peer
        socket.send_json({"type": "RequestVote", "payload": req_payload})
```

---

## 3. The Log Compression & Snapshotting
If a cluster runs for months, the log grows indefinitely, consuming disk space and slowing down startup times. 

To solve this, I implemented **Log Snapshotting**. Once the log exceeds 10,000 entries:
1. The database state is serialized (snapshot).
2. The log entries prior to the snapshot index are deleted.
3. If a follower crashes and falls too far behind, the leader skips log replication and directly streams the snapshot using `InstallSnapshot` chunks.

---

## 4. Key Learnings
Implementing Raft taught me that network partitions are the norm, not the exception:
* **Term Leaping**: If a node gets partitioned and comes back with a higher term, the current Leader must immediately step down to Follower.
* **Lease Read Performance**: To achieve under 150ms latency, the Leader maintains a local **Lease**. If the lease is active, read commands are answered immediately without a full round of quorum consensus, greatly improving throughput.
