import { AddressRow } from '@/components/ui/AddressRow'
import { ChatMessage, UserStoreData } from '@/types/swap'
import { addressEquals } from '@/utils/addressEquals'
import { useTonAddress } from '@tonconnect/ui-react'
import { useEffect, useRef, FormEvent, useState } from 'react'

export function ChatWindow({ store }: { store: UserStoreData }) {
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scroll({ top: chatRef.current.scrollHeight })
    }
  }, [store.chat?.messages?.length])

  return (
    <div className="pb-4 md:py-4 h-full overflow-hidden">
      <div className="bg-slate-800/90 border border-slate-50/5 rounded grid grid-rows-[60px_1fr_140px] h-full">
        <h3 className="text-lg px-4 my-2">Chat</h3>

        <div className="w-full overflow-y-scroll min-h-[100px]" ref={chatRef}>
          {store.chat?.messages?.map((m, i) => (
            <ChatMessageRow store={store} key={i} message={m} />
          ))}
        </div>

        <ChatInput store={store} />
      </div>
    </div>
  )
}

function ChatMessageRow({ message }: { store: UserStoreData; message: ChatMessage }) {
  const connectAddress = useTonAddress(false)
  const isYou = addressEquals(message.from, connectAddress)

  return (
    <div className="mx-4 p-2 my-2 overflow-hidden bg-slate-900 rounded">
      <div className="font-bold flex">
        {isYou ? 'You' : <AddressRow containerClassName="w-full" rawAddress={message.from} />}
      </div>
      <div>{message.text}</div>
    </div>
  )
}

function ChatInput({ store }: { store: UserStoreData }) {
  const [message, setMessage] = useState('')
  const connectAddress = useTonAddress(false)

  const createMessage = (e: FormEvent) => {
    e.preventDefault()
    if (message === '') {
      return
    }

    const newMessage = {
      date: new Date(),
      from: connectAddress,
      text: message,
    }
    console.log('newMessage', newMessage)

    if (!store.chat.messages) {
      store.chat.messages = []
    }

    store.chat.messages?.push(newMessage)
    // store.chat.messages = [...(store.chat.messages || []), newMessage]
    setMessage('')
  }
  return (
    <form onSubmit={createMessage} className="flex flex-col p-2 gap-2 border-t border-slate-50/5">
      <label htmlFor="chatInput">Enter message</label>
      <input
        type="text"
        className="rounded px-2 h-12 outline-none text-white bg-slate-900"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="ml-auto bg-slate-900 p-2 rounded">
        Submit
      </button>
    </form>
  )
}
