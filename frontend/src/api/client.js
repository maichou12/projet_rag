const WEBHOOK_URL = '/webhook/chatbot';
const API_BASE = '/api';

function extractChatData(rawData) {
  const data = Array.isArray(rawData) ? rawData[0] : rawData;
  if (!data) return null;
  if (data.reponse) {
    return { reponse: data.reponse, sources: data.sources ?? [] };
  }
  if (data.body?.reponse) {
    return { reponse: data.body.reponse, sources: data.body.sources ?? [] };
  }
  return null;
}

export async function sendChatMessage(question) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  const text = await res.text();

  if (!text.trim()) {
    throw new Error(
      `Réponse vide (HTTP ${res.status}). Vérifiez n8n : workflow publié, timeout 120s, Respond to Webhook configuré.`
    );
  }

  let rawData;
  try {
    rawData = JSON.parse(text);
  } catch {
    throw new Error(`Réponse non-JSON : ${text.slice(0, 120)}`);
  }

  if (!res.ok) {
    throw new Error(rawData?.detail || rawData?.message || `Erreur serveur (${res.status})`);
  }

  const data = extractChatData(rawData);
  if (!data?.reponse) {
    throw new Error('Aucune réponse reçue. Vérifiez le workflow n8n.');
  }
  return data;
}

export async function fetchConversations() {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error('Impossible de charger les discussions');
  const data = await res.json();
  return data.conversations;
}

export async function createConversation() {
  const res = await fetch(`${API_BASE}/conversations`, { method: 'POST' });
  if (!res.ok) throw new Error('Impossible de créer la discussion');
  const data = await res.json();
  return data.conversation;
}

export async function fetchConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${id}`);
  if (!res.ok) throw new Error('Discussion introuvable');
  const data = await res.json();
  return data.conversation;
}

export async function updateConversation(id, messages, title = null) {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, title }),
  });
  if (!res.ok) throw new Error('Impossible de sauvegarder la discussion');
  const data = await res.json();
  return data.conversation;
}

export async function deleteConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Impossible de supprimer la discussion');
}

export async function fetchSuggestions() {
  const res = await fetch(`${API_BASE}/suggestions`);
  if (!res.ok) throw new Error('Impossible de charger les suggestions');
  const data = await res.json();
  return data.suggestions;
}
