import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/index.css'
import { useStore } from './store'

// URLパラメータ処理をmain.tsxレベルで実行
const handleUrlParams = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  
  // 複数のToDoを同時作成
  const todoNames = urlParams.getAll('make_todo_name')
  if (todoNames.length > 0) {
    const todoTags = urlParams.get('tags')
    const tags = todoTags ? todoTags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    for (const todoName of todoNames) {
      const todo = await useStore.getState().add('todo')
      await useStore.getState().update(todo.id, { 
        title: decodeURIComponent(todoName),
        content: '',
        tags
      })
    }
    
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('make_todo_name')
    newUrl.searchParams.delete('tags')
    window.history.replaceState({}, '', newUrl.toString())
    return
  }

  // 複数のメモを同時作成
  const memoNames = urlParams.getAll('make_memo_name')
  const memoContents = urlParams.getAll('memo')
  if (memoNames.length > 0 || memoContents.length > 0) {
    const memoTags = urlParams.get('tags')
    const tags = memoTags ? memoTags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const maxLength = Math.max(memoNames.length, memoContents.length)
    for (let i = 0; i < maxLength; i++) {
      const memo = await useStore.getState().add('memo')
      await useStore.getState().update(memo.id, { 
        title: memoNames[i] ? decodeURIComponent(memoNames[i]!) : 'New Memo',
        content: memoContents[i] ? decodeURIComponent(memoContents[i]!) : '',
        tags
      })
    }
    
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('make_memo_name')
    newUrl.searchParams.delete('memo')
    newUrl.searchParams.delete('tags')
    window.history.replaceState({}, '', newUrl.toString())
    return
  }

  // 複数のリンクを同時作成
  const linkNames = urlParams.getAll('make_link_name')
  const linkUrls = urlParams.getAll('link')
  if (linkNames.length > 0 || linkUrls.length > 0) {
    const linkTags = urlParams.get('tags')
    const tags = linkTags ? linkTags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const maxLength = Math.max(linkNames.length, linkUrls.length)
    for (let i = 0; i < maxLength; i++) {
      const link = await useStore.getState().add('link')
      await useStore.getState().update(link.id, { 
        title: linkNames[i] ? decodeURIComponent(linkNames[i]!) : 'New Link',
        href: linkUrls[i] ? decodeURIComponent(linkUrls[i]!) : '',
        tags
      })
    }
    
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('make_link_name')
    newUrl.searchParams.delete('link')
    newUrl.searchParams.delete('tags')
    window.history.replaceState({}, '', newUrl.toString())
    return
  }

  // 複数のリストを同時作成
  const listNames = urlParams.getAll('make_list_name')
  const listItems = urlParams.getAll('list')
  if (listNames.length > 0 || listItems.length > 0) {
    const listTags = urlParams.get('tags')
    const tags = listTags ? listTags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const maxLength = Math.max(listNames.length, listItems.length)
    for (let i = 0; i < maxLength; i++) {
      const list = await useStore.getState().add('list')
      const items = listItems[i] ? decodeURIComponent(listItems[i]!).split(',').map(item => item.trim()).filter(item => item) : ['']
      await useStore.getState().update(list.id, { 
        title: listNames[i] ? decodeURIComponent(listNames[i]!) : 'New List',
        list: items,
        tags
      })
    }
    
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('make_list_name')
    newUrl.searchParams.delete('list')
    newUrl.searchParams.delete('tags')
    window.history.replaceState({}, '', newUrl.toString())
    return
  }

  // 複数の日付を同時作成
  const dateNames = urlParams.getAll('make_date_name')
  const dateValues = urlParams.getAll('date')
  const dateNotes = urlParams.getAll('date_note')
  if (dateNames.length > 0 || dateValues.length > 0 || dateNotes.length > 0) {
    const dateTags = urlParams.get('tags')
    const tags = dateTags ? dateTags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const maxLength = Math.max(dateNames.length, dateValues.length, dateNotes.length)
    for (let i = 0; i < maxLength; i++) {
      const date = await useStore.getState().add('date')
      await useStore.getState().update(date.id, { 
        title: dateNames[i] ? decodeURIComponent(dateNames[i]!) : 'New Date',
        date: {
          selectedDate: dateValues[i] || new Date().toISOString().split('T')[0] || '',
          note: dateNotes[i] ? decodeURIComponent(dateNotes[i]!) : ''
        },
        tags
      })
    }
    
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('make_date_name')
    newUrl.searchParams.delete('date')
    newUrl.searchParams.delete('date_note')
    newUrl.searchParams.delete('tags')
    window.history.replaceState({}, '', newUrl.toString())
    return
  }
}

// アプリケーション開始前にURLパラメータを処理
handleUrlParams()

const root = document.getElementById('root')!
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
