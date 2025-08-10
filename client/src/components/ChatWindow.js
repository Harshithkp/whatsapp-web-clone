import React, { useState, useEffect, useRef } from 'react';

const EMOJIS = ['😀','😁','😂','🤣','😊','😍','😎','👍','🙏','🔥','🎉','😅','🤔','😢','👏','✨','💯'];

function formatTime(ts){
  if(!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate()-1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if(isToday) return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  if(isYesterday) return 'Yesterday ' + d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

export default function ChatWindow({ wa_id, messages, onSend, typing }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef();
  useEffect(()=> bottomRef.current?.scrollIntoView({behavior:'smooth'}), [messages, typing]);

  if(!wa_id) return <div className="chat empty">Select a conversation</div>;

  function handleSend(e){
    e?.preventDefault();
    if(!text.trim()) return;
    onSend(wa_id, text);
    setText('');
  }
  function addEmoji(em){
    setText(t=> t + em);
    setShowEmoji(false);
  }

  return (
    <div className="chat" role="main">
      <div className="chat-header">
        <div style={{display:'flex', flexDirection:'column'}}>
          <div className="title">{wa_id}</div>
          <div style={{fontSize:13, color:'var(--muted)'}}>{/* participants or status could go here */}</div>
        </div>
        <div style={{marginLeft:'auto', color:'var(--muted)'}}>Online</div>
      </div>

      <div className="chat-messages" aria-live="polite">
        {messages.map(m=>(
          <div key={m._id || m.message_id} className={'bubble ' + (m.direction==='out' ? 'out':'in')}>
            <div style={{whiteSpace:'pre-wrap'}} className="text">{m.text}</div>
            <div className="meta">
              <div>{formatTime(m.timestamp)}</div>
              {m.direction==='out' && (
                <div className="ticks" title={m.status || ''} style={{marginLeft:8}}>
                  {m.status === 'read' ? (
                    <svg className="tick" viewBox="0 0 24 24"><path fill="#4fc3f7" d="M21.29 6.71L10 18l-5.29-5.29 1.42-1.42L10 15.17l9.88-9.88z"/></svg>
                  ) : m.status === 'delivered' ? (
                    <svg className="tick" viewBox="0 0 24 24"><path fill="rgba(255,255,255,0.9)" d="M21.29 6.71L10 18l-5.29-5.29 1.42-1.42L10 15.17l9.88-9.88z"/></svg>
                  ) : (
                    <svg className="tick" viewBox="0 0 24 24"><path fill="rgba(255,255,255,0.6)" d="M9 16.2l-3.5-3.5L6.91 11 9 13.09 17.09 5 19.5 7.41z"/></svg>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && <div className="typing">Typing... ⌨️</div>}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <div className="input-inner">
          <button type="button" onClick={()=>setShowEmoji(s=>!s)} className="btn" aria-label="Emoji">😊</button>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" />
          <button type="submit" className="btn">Send</button>
        </div>
        {showEmoji && (
          <div className="emoji-picker" role="dialog" aria-label="Emoji picker">
            {EMOJIS.map(em=>(
              <div key={em} className="emoji" onClick={()=>addEmoji(em)}>{em}</div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
