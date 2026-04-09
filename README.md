# UserMap — The Agentic Data Management Platform (DMP)

> **The Universal Source of Truth** — Connect every device, tool, and workspace once. Let **Prism** structure your world.

UserMap is a high-performance, local-first Data Management Platform designed to ingest, arrange, and provision personal and enterprise context. It bridges the gap between raw data (Social Archives, Workspaces, Health Apps) and the next generation of AI Agents and automation tools.

---

## 💎 The Vision: "Everything, Structured."

Our goal is simple but extensive: A platform where a user connects literally *everything* — from fitness trackers and social media archives to GitHub repos and company Slack channels. 

**Prism**, our resident AI Agent, continuously monitors this incoming data, rearranges it into a semantic knowledge graph, and acts as a **"Context Valve"** for outgoing requests.

---

## 🚀 Key Capabilities

### 1. The Prism AI Agent (ReAct)
Unlike passive databases, UserMap is powered by **Prism**, a ReAct-style agent. Prism doesn't just store data; it reasons about it. It manages your "Private Memory" boundaries and determines what context is relevant for any given task.

### 2. Continuous Structuring (Background Daemon)
Ingestion isn't a one-time event. UserMap features a background service where Prism "watches" incoming streams (connected apps or uploaded archives) and automatically updates nodes in your knowledge graph.
*   *Example:* "I just detected a Twitter archive from 2019. Updating 'Interests' and 'Historical Network' clusters."

### 3. The "Context Valve" (Outgoing API)
UserMap acts as a privacy-preserving proxy for your context. External automation tools (Zapier, Make, custom AI agents) call UserMap to pull context. 
*   **Selective Filtering**: Prism understands the *intent* of the request and sends ONLY the needed context.
*   *Example Request:* "Provide context for a LinkedIn message to a Software Engineer."
*   *Prism Logic:* Prism filters out your health data and private family photos, providing only your technical stack history and recent GitHub activity.

### 4. Local-First Data Sovereignty
UserMap is an Electron-based desktop application. All data (Social Archives, OAuth tokens, Knowledge Graphs) is stored strictly in your local SQLite database (`~/.usermap/usermap.db`). 

---

## 📂 Feature Roadmap

| Feature Group | Status | Highlights |
|---|---|---|
| **Data Ingestion** | ✅ Active | Social Archive (.zip) parsing, Slack, GitHub, Gmail, Local File indexing. |
| **Prism Agent** | ✅ Active | ReAct thinking loop, Knowledge Graph management, Fact extraction. |
| **Automation Hub** | ✅ Active | **Context Valve API** (`/api/prism/context`) for external tool integration. |
| **Structuring** | ✅ Active | Continuous background analysis of ingested context. |
| **Enterprise RBAC** | 🔜 Planned | CEO/Manager/Employee visibility roles; Admin-controlled data partitions. |
| **Cross-Device** | 🔜 Planned | Secure peer-to-peer sync between local UserMap instances. |

---

## 🛠 Quick Start

### 1. Install Dependencies
```bash
git clone https://github.com/mhkr9100/UserMap.git
cd UserMap
npm install
```

### 2. Run Local Development
```bash
npm run dev
```
*   **Desktop UI**: `http://localhost:3000`
*   **DMP Server (API)**: `http://localhost:5185`

### 3. Connect Your World
1.  **Social Archives**: Open the **Integrations** panel and drop your Facebook/X/LinkedIn GDPR export (.zip). Prism will begin background structuring.
2.  **Cloud Tools**: Connect Google, GitHub, and Slack via the Tools menu.
3.  **Local AI**: Connect [Ollama](https://ollama.com) with one click for a 100% offline agent experience.

---

## 🔌 API Reference (The Context Valve)

Automation tools can query the context valve to get "Clean Context":

**POST `/api/prism/context`**
```json
{
  "intent": "Drafting a follow-up email to a developer I met on GitHub",
  "limit": 5
}
```

**Response:**
```json
{
  "prism_status": "REFLECTED",
  "results": [
    {
      "source": "github",
      "content": "Merged PR #42 in react-usermap...",
      "relevance_reasoning": "Direct interaction with the subject developer."
    }
  ]
}
```

---

## 🔒 Security & Privacy

*   **Zero-Knowledge**: Your API keys and tokens stay in `localStorage`.
*   **Local Storage**: Data persists in an encrypted SQLite database on your machine.
*   **Gatekeeping**: Prism is trained to deny "Private Memory" access unless the user provides explicit permission during the ReAct loop.

---

Developed with 💜 for the **Quantified Self** and **Agentic Future**.
