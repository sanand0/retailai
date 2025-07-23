import { asyncLLM } from "https://cdn.jsdelivr.net/npm/asyncllm@2";

let slidesContent = '';
let isListening = false;
let recognition = null;

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const voiceButton = document.getElementById('voice-button');
const thinking = document.getElementById('thinking');

const loadSlidesContent = async () => {
    try {
        const response = await fetch('slides.json');
        const data = await response.json();
        
        // Format slides content for LLM
        const formattedSlides = data.slides.map(slide => {
            const demos = slide.demos ? slide.demos.map(demo => {
                const demoDetails = data.demos.find(d => d.demo === demo);
                return demoDetails ? `${demoDetails.demo}: ${demoDetails.description} (Link: ${demoDetails.link})` : demo;
            }).join('\n') : 'No demos available';
            
            return `**${slide.title}**\n${slide.description}\nAvailable Demos:\n${demos}`;
        }).join('\n\n');
        
        slidesContent = formattedSlides;
    } catch (error) {
        console.error('Error loading slides:', error);
        slidesContent = 'Retail AI content unavailable';
    }
};

const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            isListening = true;
            voiceButton.textContent = '🔴 Stop';
            voiceButton.classList.add('listening');
        };
        
        recognition.onend = () => {
            isListening = false;
            voiceButton.textContent = '🎤 Voice';
            voiceButton.classList.remove('listening');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            sendMessage();
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            voiceButton.textContent = '🎤 Voice';
            voiceButton.classList.remove('listening');
        };
    } else {
        voiceButton.style.display = 'none';
    }
};

const addMessage = (content, isUser = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    if (isUser) {
        messageDiv.textContent = content;
    } else {
        messageDiv.innerHTML = marked.parse(content);
        // Make all links open in new tab
        const links = messageDiv.querySelectorAll('a');
        links.forEach(link => {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
};

const sendMessage = async () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    
    // Add user message
    addMessage(userMessage, true);
    chatInput.value = '';
    
    // Show thinking indicator
    thinking.classList.add('show');
    sendButton.disabled = true;
    
    // Create AI message container
    const aiMessageDiv = addMessage('', false);
    
    try {
        const systemPrompt = `You are a helpful AI assistant specializing in retail AI applications and use cases. 

Please answer questions concisely and reference the provided retail AI content when relevant. Keep responses focused and practical.

Here is the retail AI content for reference:

${slidesContent}

Guidelines:
- Answer questions directly and concisely
- Reference specific use cases from the content when applicable
- Use bullet points or numbered lists for clarity when appropriate
- Keep responses under 200 words when possible
- When mentioning demos, ALWAYS include clickable links using markdown format: [Demo Name](link_url)
- Include demo links whenever relevant to help users explore the solutions
- Make sure all demo links open in new windows/tabs`;

        let fullResponse = '';
        
        for await (const { content, error } of asyncLLM("https://llmfoundry.straive.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                stream: true
            })
        })) {
            if (error) {
                console.error('LLM Error:', error);
                aiMessageDiv.innerHTML = '<strong>Sorry, I encountered an error processing your request. Please try again.</strong>';
                break;
            }
            
            if (content) {
                fullResponse = content;
                aiMessageDiv.innerHTML = marked.parse(fullResponse);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        aiMessageDiv.innerHTML = '<strong>Sorry, I encountered an error processing your request. Please try again.</strong>';
    } finally {
        thinking.classList.remove('show');
        sendButton.disabled = false;
    }
};

const toggleVoiceRecognition = () => {
    if (!recognition) return;
    
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
};

// Event listeners
sendButton.addEventListener('click', sendMessage);
voiceButton.addEventListener('click', toggleVoiceRecognition);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadSlidesContent();
    initSpeechRecognition();
    chatInput.focus();
});