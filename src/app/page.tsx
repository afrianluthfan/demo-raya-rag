'use client';

import Script from 'next/script';

export default function Home() {
  const initializeChatbot = () => {
    console.log('🔄 Starting chatbot initialization...');
    
    // Add a longer delay to ensure DOM is fully ready and avoid race conditions
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.RayaChatbot) {
        try {
          console.log('🚀 Initializing RayaChatbot with internal endpoints...');
          
          const chatbot = new window.RayaChatbot({
            position: 'bottom-right',
            primaryColor: '#3b82f6',
            // Use the correct internal dev API endpoints
            apiUrl: 'https://langflow.dev.internal.rayain.net/api/v1/run/aa032f57-c478-40ce-941e-620099e3985b',
            apiKey: 'sk-dCg8QJblKdVNHnQJ_N9-_HvFjg0TkplPZZ2mM306rhk',
            messagesApiUrl: 'https://langflow.dev.internal.rayain.net/api/v1/monitor/messages?flow_id=aa032f57-c478-40ce-941e-620099e3985b',
            // Keep demo UI configuration
            title: 'Raya Assistant',
            subtitle: 'Bank Raya Digital Assistant',
            welcomeTitle: 'Welcome to Raya RAG Chat',
            welcomeSubtitle: 'Start a new conversation or browse your previous chat sessions. How can I help you today?'
          });

          // Add to global scope for debugging
          window.chatbotInstance = chatbot;
          
          console.log('✅ Chatbot initialized successfully with internal API endpoints');
        } catch (error) {
          console.error('❌ Error initializing chatbot:', error);
          
          // Enhanced error logging for debugging
          if (error instanceof Error) {
            console.log('Error details:', {
              message: error.message,
              stack: error.stack,
              name: error.name,
              cause: error.cause
            });
            
            // Check if it's a network issue
            if (error.message.includes('Failed to fetch')) {
              console.warn('🌐 Network issue detected. This might require VPN access to internal endpoints.');
            }
          }
        }
      } else {
        console.warn('⚠️ RayaChatbot not available on window object');
        
        // Retry with exponential backoff
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.RayaChatbot) {
            console.log('🔄 Retrying chatbot initialization...');
            initializeChatbot();
          } else {
            console.error('❌ RayaChatbot still not available after retry');
          }
        }, 2000);
      }
    }, 1000); // Increased delay to 1000ms to avoid race conditions
  };

  return (
    <>
      <Script 
        src="/dev-raya-chatbot.js" 
        onLoad={() => {
          console.log('📄 Chatbot script loaded successfully');
          initializeChatbot();
        }}
        onError={(e) => {
          console.error('❌ Failed to load chatbot script:', e);
        }}
        strategy="afterInteractive"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              AI-Powered Chat Assistant
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Raya Chatbot
              <span className="block text-blue-600">Demo Experience</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience our intelligent chatbot powered by advanced RAG (Retrieval-Augmented Generation) technology. 
              Get instant, contextual responses to your questions with our AI assistant.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Conversations</h3>
                <p className="text-gray-600">Engage in human-like dialogue with contextual understanding</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Accurate Answers</h3>
                <p className="text-gray-600">RAG technology ensures relevant and contextual responses</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Integration</h3>
                <p className="text-gray-600">Simple to embed in any web application or framework</p>
              </div>
            </div>

            {/* Chatbot Indicator - Mobile: bottom-left, Desktop: bottom-right */}
            <div className="fixed bottom-24 left-4 min-[501px]:left-auto min-[501px]:right-8 z-40 flex flex-col items-start min-[501px]:items-end space-y-2">
              <div className="bg-blue-600 text-white px-3 py-2 min-[501px]:px-4 rounded-lg shadow-lg">
                <p className="text-xs min-[501px]:text-sm font-medium whitespace-nowrap">Try the chatbot! 👋</p>
              </div>
              <svg 
                className="w-6 h-6 min-[501px]:w-8 min-[501px]:h-8 text-blue-600 animate-bounce ml-2 min-[501px]:ml-0 min-[501px]:mr-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600">
              Powered by Raya RAG Technology • Built with Next.js and Tailwind CSS
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
