import { useState, useMemo } from 'react'

type Props = {
  selectedDate: string
}

export function MiniCalendar({ selectedDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(selectedDate)
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }, [currentMonth])

  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate])
  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDateObj.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="mini-calendar bg-transparent rounded p-0.5">
      <div className="text-center text-[8px] font-medium mb-1 opacity-70">
        {currentMonth.getFullYear()}/{monthNames[currentMonth.getMonth()]}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-[6px]">
        {dayNames.map(day => (
          <div key={day} className="text-center text-gray-500 p-0.5 opacity-60">
            {day}
          </div>
        ))}
        {calendarDays.map((date: Date, index: number) => (
          <div
            key={index}
            className={`
              text-center p-0.5 rounded-sm
              ${isSelectedDate(date) 
                ? 'bg-blue-500 text-white font-medium' 
                : isCurrentMonth(date) 
                  ? 'text-gray-700' 
                  : 'text-gray-400 opacity-50'
              }
            `}
          >
            {date.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}
