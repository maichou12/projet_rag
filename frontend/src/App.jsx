import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import QuickQuestions from './components/QuickQuestions';
import SourcesPanel from './components/SourcesPanel';
import ArticleViewer from './components/ArticleViewer';
import { useChatStore } from './store/useChatStore';

export default function App() {
  const [articleView, setArticleView] = useState(null);
  const {
    conversations,
    activeId,
    messages,
    sources,
    suggestions,
    input,
    loading,
    loadingList,
    sidebarOpen,
    setInput,
    setSidebarOpen,
    selectConversation,
    startNewConversation,
    removeConversation,
    sendMessage,
    prefillQuestion,
  } = useChatStore();

  useEffect(() => {
    useChatStore.getState().init();
  }, []);

  const handleSelect = async (id) => {
    await selectConversation(id);
    setSidebarOpen(false);
  };

  const handleNew = async () => {
    await startNewConversation();
    setSidebarOpen(false);
  };

  const handleSend = () => sendMessage();

  const openArticle = ({ idArticle, page }) => {
    const pageNum = Number.parseInt(String(page), 10);
    if (!idArticle || !Number.isFinite(pageNum) || pageNum < 1) return;
    setArticleView({ idArticle: String(idArticle), page: pageNum });
  };

  const showWelcome = messages.length <= 1 && messages[0]?.isWelcome;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-primary-deep">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        loading={loadingList}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={removeConversation}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow
        messages={messages}
        loading={loading}
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenPdf={openArticle}
        showWelcome={showWelcome}
        suggestions={suggestions}
        onPrefill={prefillQuestion}
      />

      {/* Panneau droit : questions + sources */}
      <aside className="hidden md:flex flex-col w-[300px] min-w-[300px] h-full bg-white border-l border-black/5 overflow-y-auto">
        {showWelcome && (
          <QuickQuestions
            suggestions={suggestions}
            onSelect={prefillQuestion}
            loading={loading}
          />
        )}
        <SourcesPanel sources={sources} onOpenPdf={openArticle} />
      </aside>

      {articleView && (
        <ArticleViewer
          articleId={articleView.idArticle}
          page={articleView.page}
          onClose={() => setArticleView(null)}
        />
      )}
    </div>
  );
}
