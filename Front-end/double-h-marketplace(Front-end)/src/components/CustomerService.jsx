import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  ChevronLeft,
  Headset,
  Phone,
  Mail,
  FileWarning,
  CheckCircle2,
} from "lucide-react";
import { QUICK_TOPICS, answerFor, answerForTopic } from "../data/faq";

const WELCOME_MESSAGE = {
  from: "bot",
  text:
    "Hi! I'm the PAK Hardware assistant. I can help with orders, shipping, returns, payments, and more — what do you need help with today?",
};

const EMPTY_TICKET = { subject: "", message: "" };

export default function CustomerService({ onBack, onSubmitTicket }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const [ticketForm, setTicketForm] = useState(EMPTY_TICKET);
  const [ticketSent, setTicketSent] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function pushBotReply(replyText) {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: replyText }]);
      setIsTyping(false);
    }, 550);
  }

  function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    pushBotReply(answerFor(trimmed));
  }

  function handleTopicClick(topic) {
    setMessages((prev) => [...prev, { from: "user", text: topic.label }]);
    pushBotReply(answerForTopic(topic.id));
  }

  function handleTicketSubmit(e) {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) return;
    onSubmitTicket(ticketForm);
    setTicketForm(EMPTY_TICKET);
    setTicketSent(true);
    setTimeout(() => setTicketSent(false), 3000);
  }

  return (
    <div className="page support-page">
      <button className="back-link" onClick={onBack}>
        <ChevronLeft size={16} /> Back to store
      </button>

      <div className="support-grid">
        <section className="chat-panel">
          <header className="chat-header">
            <span className="bot-avatar">
              <Bot size={20} />
            </span>
            <div>
              <h2>PAK Hardware Assistant</h2>
              <span className="chat-status">
                <span className="status-dot" /> Online now — AI-powered
              </span>
            </div>
          </header>

          <div className="chat-log" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble-row ${m.from}`}>
                <span className="chat-avatar">
                  {m.from === "bot" ? <Bot size={16} /> : <User size={16} />}
                </span>
                <p className="chat-bubble">{m.text}</p>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row bot">
                <span className="chat-avatar">
                  <Bot size={16} />
                </span>
                <p className="chat-bubble typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </p>
              </div>
            )}
          </div>

          <div className="quick-topics">
            {QUICK_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  className="quick-topic-chip"
                  onClick={() => handleTopicClick(topic)}
                >
                  <Icon size={14} /> {topic.label}
                </button>
              );
            })}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask about an order, return, payment..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary chat-send">
              <Send size={15} /> Send
            </button>
          </form>
        </section>

        <aside className="support-side">
          <div className="panel">
            <h3>
              <Sparkles size={16} className="inline-icon" /> Instant answers
            </h3>
            <p className="empty-state">
              This assistant matches your message against common topics —
              order tracking, shipping, returns, payments, warranty, vendor
              onboarding, and account help — for a fast first answer, day or
              night.
            </p>
          </div>

          <div className="panel">
            <h3>
              <FileWarning size={16} className="inline-icon" /> Report a problem
            </h3>
            <p className="empty-state">
              Raise a ticket and an admin will get back to you here — check My Tickets on your
              next visit for the reply.
            </p>
            <form className="ticket-form" onSubmit={handleTicketSubmit}>
              <input
                type="text"
                placeholder="Subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
              />
              <textarea
                rows={3}
                placeholder="Describe the issue..."
                value={ticketForm.message}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, message: e.target.value }))}
              />
              <button type="submit" className="btn btn-primary ticket-submit">
                {ticketSent ? (
                  <>
                    <CheckCircle2 size={15} /> Submitted!
                  </>
                ) : (
                  "Submit Ticket"
                )}
              </button>
            </form>
          </div>

          <div className="panel">
            <h3>
              <Headset size={16} className="inline-icon" /> Prefer a human?
            </h3>
            <p className="empty-state">
              Our support team is available Mon–Sat, 9 AM – 9 PM PKT. Ask the
              assistant to connect you, or reach us directly:
            </p>
            <ul className="contact-list">
              <li>
                <Phone size={14} /> 0800-PAKHW (0800-725-49)
              </li>
              <li>
                <Mail size={14} /> support@pakhardware.pk
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
