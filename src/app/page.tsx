'use client';

import Script from 'next/script';

export default function Home() {
  const initializeChatbot = () => {
    // Initialize the chatbot with custom daily limit for testing
    if (typeof window !== 'undefined' && (window as any).RayaChatbot) {
      const chatbot = new (window as any).RayaChatbot({
        position: 'bottom-right',
        primaryColor: '#3b82f6',
        dailyMessageLimit: 5, // Set to 5 for easier testing
        timezone: 'GMT+7'
      });

      // Add to global scope for debugging
      (window as any).chatbotInstance = chatbot;
    }
  };

  return (
    <>
      <Script 
        src="/dev-raya-chatbot.js" 
        onLoad={initializeChatbot}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Get instant responses powered by advanced AI technology</p>
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

            {/* Chatbot Indicator */}
            <div className="fixed bottom-20 right-20 z-40 flex items-center space-x-3 animate-pulse">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-medium whitespace-nowrap">Try the chatbot! 👋</p>
              </div>
              <div className="flex flex-col items-center">
                <svg 
                  className="w-6 h-6 text-blue-600 animate-bounce" 
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
                <svg 
                  className="w-4 h-4 text-blue-600 animate-bounce" 
                  style={{ animationDelay: '0.1s' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 8l4 4 4-4" 
                  />
                </svg>
              </div>
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
